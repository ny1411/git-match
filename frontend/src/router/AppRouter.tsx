import React from "react";
import { Routes, Route } from "react-router-dom";

// Import page components
import LandingPage from "../pages/Landing";
import Features from "../pages/Features";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Login from "../pages/Login";
import Onboarding from "../pages/Onboarding";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Matches from "../pages/Matches";
import Chat from "../pages/Chat";

const AppRouter: React.FC = () => {
	return (
		<Routes>
			{/* Landing page is the default route */}
			<Route path="/" element={<LandingPage />} />

			{/* Homepage navbar elements */}
			<Route path="/features" element={<Features />} />
			<Route path="/about" element={<About />} />
			<Route path="/contact" element={<Contact />} />

			{/* Other routes from your structure */}
			<Route path="/login" element={<Login />} />
			<Route path="/onboarding" element={<Onboarding />} />
			<Route path="/dashboard" element={<Dashboard />} />
			<Route path="/profile" element={<Profile />} />
			<Route path="/matches" element={<Matches />} />
			<Route path="/chat" element={<Chat />} />

			{/* Add a fallback/404 route */}
			<Route path="*" element={<LandingPage />} />
		</Routes>
	);
};

export default AppRouter;
