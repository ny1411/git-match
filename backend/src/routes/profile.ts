import { Router, Request, Response, NextFunction } from "express";
import admin from "../firebase/admin.js";
import { StorageService } from "../utils/storage.js";
import {
	UpdateProfileRequest,
	ProfileResponse,
	UserProfile,
} from "../types/user.js";

interface AuthenticatedRequest extends Request {
	user?: {
		uid: string;
		[key: string]: any;
	};
}

const router = Router();

// Middleware to verify Firebase ID token or Custom token
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
	const authHeader = (req.headers.authorization || "") as string;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res
			.status(401)
			.json({ success: false, message: "No token provided" });
	}

	const token = authHeader.split("Bearer ")[1];

	try {
		const decodedToken = await admin.auth().verifyIdToken(token);
		(req as AuthenticatedRequest).user = decodedToken as any;
		return next();
	} catch (error: any) {
		console.error("ID token verification failed:", error.message);

		// If ID token verification fails, try custom token
		try {
			const decodedToken = await admin
				.auth()
				.verifySessionCookie(token, true)
				.catch(() => {
					throw new Error("Not a session cookie");
				});
			(req as AuthenticatedRequest).user = decodedToken as any;
			return next();
		} catch (customError: any) {
			console.error(
				"Custom token verification also failed:",
				customError.message
			);
			return res
				.status(401)
				.json({ success: false, message: "Invalid or expired token" });
		}
	}
};

// Get current user's profile (authenticated)
router.get("/me", verifyToken, async (req: Request, res: Response) => {
	try {
		const userId = (req as AuthenticatedRequest).user!.uid;

		const userDoc = await admin
			.firestore()
			.collection("users")
			.doc(userId)
			.get();

		if (!userDoc.exists) {
			const response: ProfileResponse = {
				success: false,
				message: "Profile not found",
			};
			return res.status(404).json(response);
		}

		const profile = userDoc.data() as UserProfile;

		const response: ProfileResponse = {
			success: true,
			message: "Profile retrieved successfully",
			profile,
		};

		return res.json(response);
	} catch (error) {
		console.error("Get profile error:", error);
		const response: ProfileResponse = {
			success: false,
			message: "Failed to retrieve profile",
		};
		return res.status(500).json(response);
	}
});

// Update current user's profile (authenticated)
router.put("/me",profileLimiter, verifyToken, async (req: Request, res: Response) => {
	try {
		const userId = (req as AuthenticatedRequest).user!.uid;
		const updateData = req.body as UpdateProfileRequest;

		// Get current profile
		const userDocRef = admin.firestore().collection("users").doc(userId);
		const userDoc = await userDocRef.get();
		if (!userDoc.exists) {
			const response: ProfileResponse = {
				success: false,
				message: "Profile not found",
			};
			return res.status(404).json(response);
		}

		const currentProfile = userDoc.data() as UserProfile;
		let profileImageUrl = currentProfile.profileImage;

		// Handle profile image upload if provided (assume base64)
		if (updateData.profileImage) {
			try {
				if (currentProfile.profileImage) {
					await StorageService.deleteProfileImage(userId);
				}
				profileImageUrl = await StorageService.uploadBase64Image(
					updateData.profileImage,
					userId,
					"profile.jpg"
				);
			} catch (imageError) {
				console.error("Image upload error:", imageError);
				const response: ProfileResponse = {
					success: false,
					message: "Failed to upload profile image",
				};
				return res.status(400).json(response);
			}
		}

		// Handle dob/dateOfBirth and calculate age if needed
		let age = (updateData as any).age as number | undefined;
		// Frontend may send `dob` as Date/string or `dateOfBirth` as string
		const dobInput = (updateData as any).dob ?? (updateData as any).dateOfBirth;
		let dobIso: string | undefined = undefined;
		if (dobInput !== undefined && dobInput !== null) {
			const dob = new Date(dobInput);
			if (!isNaN(dob.getTime())) {
				dobIso = dob.toISOString();
			}
			if ((age === undefined || age === null) && dobIso) {
				const today = new Date();
				let calcAge = today.getFullYear() - dob.getFullYear();
				const m = today.getMonth() - dob.getMonth();
				if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
					calcAge--;
				}
				age = calcAge;
			}
		}

		// Construct location from city/country or geolocation if provided
		let locationFromParts: string | null | undefined = undefined;
		const city = (updateData as any).city as string | null | undefined;
		const country = (updateData as any).country as
			| string
			| null
			| undefined;
		if (city !== undefined || country !== undefined) {
			if (city === null && country === null) {
				locationFromParts = null;
			} else {
				const parts: string[] = [];
				if (city && city.trim() !== "") parts.push(city.trim());
				if (country && country.trim() !== "") parts.push(country.trim());
				locationFromParts = parts.length > 0 ? parts.join(", ") : null;
			}
		}

		// Normalize geolocation object if provided
		const geo = (updateData as any).geolocation as
			| { lat?: number | null; lng?: number | null }
			| undefined
			| null;
		const geolocationField = geo !== undefined ? geo : undefined;

		// Prepare update object
		// Map new frontend fields to backend profile shape
		const updatedProfile: Partial<UserProfile> = {
			...updateData,
			// store calculated ISO dob if present
			...(dobIso ? { dateOfBirth: dobIso } : {}),
			profileImage: profileImageUrl,
			age: age,
			// geolocation nested object
			...(geolocationField !== undefined ? { geolocation: geolocationField } : {}),
			// map interests array to both `interests` and legacy comma `interest`
			...(updateData && (updateData as any).interests
				? { interests: (updateData as any).interests }
				: {}),
			...(updateData && (updateData as any).interests
				? { interest: (updateData as any).interests.join(",") }
				: {}),
			// map relationshipGoals -> goal (legacy)
			...(updateData && (updateData as any).relationshipGoals
				? { goal: (updateData as any).relationshipGoals }
				: {}),
			// genderPreference stored if provided
			...(updateData && (updateData as any).genderPreference
				? { genderPreference: (updateData as any).genderPreference }
				: {}),
			// retain location override
			...(locationFromParts !== undefined
				? { location: locationFromParts }
				: {}),
			updatedAt: new Date().toISOString(),
		};

		// Remove undefined fields
		Object.keys(updatedProfile).forEach((key) => {
			if ((updatedProfile as any)[key] === undefined) {
				delete (updatedProfile as any)[key];
			}
		});

		// Update in Firestore
		await userDocRef.update(updatedProfile);

		// Return updated profile
		const updatedDoc = await userDocRef.get();
		const profile = updatedDoc.data() as UserProfile;

		const response: ProfileResponse = {
			success: true,
			message: "Profile updated successfully",
			profile,
		};
		return res.json(response);
	} catch (error) {
		console.error("Update profile error:", error);
		const response: ProfileResponse = {
			success: false,
			message: "Failed to update profile",
		};
		return res.status(500).json(response);
	}
});

// Get user profile by ID (public endpoint)
router.get("/:userId", async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;

		const userDoc = await admin
			.firestore()
			.collection("users")
			.doc(userId)
			.get();

		if (!userDoc.exists) {
			const response: ProfileResponse = {
				success: false,
				message: "Profile not found",
			};
			return res.status(404).json(response);
		}

		const profile = userDoc.data() as UserProfile;

		// Remove sensitive information for public endpoint
		const publicProfile = { ...(profile as any) };
		if ((publicProfile as any).email) delete (publicProfile as any).email;

		const response: ProfileResponse = {
			success: true,
			message: "Profile retrieved successfully",
			profile: publicProfile as UserProfile,
		};

		return res.json(response);
	} catch (error) {
		console.error("Get public profile error:", error);
		const response: ProfileResponse = {
			success: false,
			message: "Failed to retrieve profile",
		};
		return res.status(500).json(response);
	}
});

export default router;
