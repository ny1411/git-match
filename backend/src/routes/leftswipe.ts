import { Router, Request, Response } from "express";
import admin from "../firebase/admin.js";
import { AuthenticatedRequest, verifyToken } from "../middleware/auth.middleware.js";

type LeftSwipeRequestBody = {
	targetUserId?: string;
};

const router = Router();

// Left swipe: store the target user's id in current user's `leftswiped` array
router.post("/", verifyToken, async (req: Request, res: Response) => {
	try {
		const userId = (req as AuthenticatedRequest).user!.uid;
		const { targetUserId } = (req.body || {}) as LeftSwipeRequestBody;

		if (!targetUserId || targetUserId.trim() === "") {
			return res.status(400).json({
				success: false,
				message: "targetUserId is required",
			});
		}

		if (targetUserId === userId) {
			return res.status(400).json({
				success: false,
				message: "Cannot left-swipe yourself",
			});
		}

		const userDocRef = admin.firestore().collection("users").doc(userId);
		const userDoc = await userDocRef.get();
		if (!userDoc.exists) {
			return res.status(404).json({
				success: false,
				message: "User profile not found",
			});
		}

		await userDocRef.update({
			leftswiped: admin.firestore.FieldValue.arrayUnion(targetUserId),
			updatedAt: new Date().toISOString(),
		});

		return res.json({
			success: true,
			message: "Left swipe recorded successfully",
		});
	} catch (error) {
		console.error("Left swipe error:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to record left swipe",
		});
	}
});

export default router;
