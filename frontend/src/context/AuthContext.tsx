
import React, {
	createContext,
	useState,
	type ReactNode,
} from "react";

// Define the shape of the context data
interface AuthContextType {
	userProfile: UserProfile | null;
	isLoading: boolean;
	error: string | null;
	signup: (data: SignupData) => Promise<AuthResponse>;
	login: (email: string, password: string) => Promise<AuthResponse>;
	logout: () => Promise<void>;
}

interface UserProfile {
	uid: string;
	fullName: string;
	email: string;
	githubProfileUrl: string;
	role: string;
	location: string;
	aboutMe: string;
	createdAt: Date;
	updatedAt: Date;
}

interface SignupData {
	fullName: string;
	email: string;
	githubProfileUrl: string;
	password?: string;
}

interface AuthResponse {
	success: boolean;
	message: string;
	user?: UserProfile;
	token?: string; // Firebase Custom Token
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(
	undefined
);

// Create the provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Firestore/API profile data
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);


	// Basic login implementation: set the user data
	const login = async (
		email: string,
		password: string
	): Promise<AuthResponse> => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("http://localhost:3000/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const result: AuthResponse = await response.json();

			if (!result.success || !result.token) {
				setError(result.message);
				setIsLoading(false);
				return result;
			}

			// Fetch the user profile data here after sign-in
			setIsLoading(false);
			return { success: true, message: "Login successful!" };
		} catch (e: any) {
			const msg = e.message || "Login failed.";
			setError(msg);
			setIsLoading(false);
			return { success: false, message: msg };
		}
	};

	// Basic signup implementation: you might call an API then set the user
	const signup = async (data: SignupData): Promise<AuthResponse> => {
		setIsLoading(true);
		setError(null);

		try {
			// Call Express Backend Signup Endpoint
			const response = await fetch("http://localhost:3000/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const result: AuthResponse = await response.json();

			if (!result.success || !result.token) {
				setError(result.message);
				setIsLoading(false);
				return result;
			}

			setUserProfile(result.user || null); // Use the profile data returned by the backend

			setIsLoading(false);
			return { success: true, message: "Signup successful!" };
		} catch (e: any) {
			console.error("Signup failed:", e);
			const msg = e.message || "An unexpected error occurred.";
			setError(msg);
			setIsLoading(false);
			return { success: false, message: msg };
		}
	};

	// Logout implementation: clear the user
	const logout = async () => {
		setIsLoading(true);
		setUserProfile(null);
		setIsLoading(false);
	};

	const value: AuthContextType = {
		userProfile,
		isLoading,
		error,
		signup,
		login,
		logout,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};