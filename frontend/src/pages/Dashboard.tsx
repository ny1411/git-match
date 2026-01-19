import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import { getDominantColors } from "../components/utils/colorUtils";
import type { Profile } from "../types/profile";
import SwipeCard from "../components/match/SwipeCard";
import { MOCK_PROFILES } from "../data/mockProfile";
import { CustomButton } from "../components/ui/CustomButton";
import { ArrowLeft, MapPin, Settings, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
	const [profiles, setProfiles] = useState<Profile[]>(MOCK_PROFILES);
	const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(
		null,
	);
	const [gradient, setGradient] = useState<string>(
		"linear-gradient(135deg, #1a1a1a 0%, #000000 100%)",
	);

	const navigate = useNavigate();

	useEffect(() => {
		if (!profiles.length) return;

		let cancelled = false;

		getDominantColors(profiles[0].image)
			.then(([shadow, mid, highlight]) => {
				if (cancelled) return;

				setGradient(`
        radial-gradient(
          circle at top left,
          ${highlight},
          transparent 90%
        ),
        radial-gradient(
          circle at bottom right,
          ${mid},
          transparent 55%
        ),
        linear-gradient(
          135deg,
          ${shadow},
          ${mid}
        )
      `);
			})
			.catch(() => {
				if (!cancelled) {
					setGradient("linear-gradient(135deg, #1b1e31, #0d0a1e)");
				}
			});

		return () => {
			cancelled = true;
		};
	}, [profiles]);

	const handleOpenLocationUpdateModal = () => {};

	// Swipe Handlers
	const handleSwipe = (direction: "left" | "right") => {
		setExitDirection(direction);

		setTimeout(() => {
			setProfiles((prev) => prev.slice(1));
			setExitDirection(null);
		}, 100); // slight delay to allow exit animation to trigger
	};

	// Variants define how the card enters and leaves
	const cardVariants = {
		hidden: { scale: 0.95, opacity: 0 },
		visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
		exit: (direction: "left" | "right") => ({
			x: direction === "left" ? -1000 : 1000,
			rotate: direction === "left" ? -20 : 20,
			opacity: 0,
			transition: { duration: 0.4, ease: easeInOut },
		}),
	};

	if (profiles.length === 0) {
		return (
			<div className="h-screen w-full flex items-center justify-center bg-black text-white">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-2">
						No more profiles
					</h2>
					<p className="text-gray-400">
						Check back later for more matches!
					</p>
				</div>
			</div>
		);
	}

	return (
		<div
			className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center relative transition-colors duration-700 ease-in-out"
			style={{ background: gradient }}
		>
			{/* Background Overlay for better text contrast */}
			<div className="absolute inset-0 bg-black/20 backdrop-blur-[60px] z-0"></div>

			<div className="absolute top-10 flex items-center justify-between w-full px-12 z-10">
				<div>
					<CustomButton
						onClick={() => {
							navigate("/");
						}}
						className="bg-white/10 text-white cursor-pointer"
					>
						<ArrowLeft />
					</CustomButton>
				</div>
				<div className="w-fit">
					<CustomButton
						onClick={handleOpenLocationUpdateModal}
						className="w-full flex items-center justify-center gap-2 px-4 bg-white/10 text-white hover:bg-green-500/20 hover:border-green-500/50 hover:text-green-400 cursor-pointer"
					>
						<MapPin />
						London
					</CustomButton>
				</div>
				<div className="flex gap-4">
					<CustomButton
						onClick={() => {
							navigate("/settings");
						}}
						className="bg-white/10 text-white hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 cursor-pointer"
					>
						<Settings />
					</CustomButton>
					<CustomButton
						onClick={() => {
							navigate("/profile");
						}}
						className="bg-white/10 text-white hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400 cursor-pointer"
					>
						<UserRound />
					</CustomButton>
				</div>
			</div>
			<div className="relative w-full max-w-sm md:max-w-md h-[70vh] z-10 flex items-center justify-center">
				<AnimatePresence custom={exitDirection}>
					{profiles.length > 0 ? (
						<motion.div
							key={profiles[0].id}
							custom={exitDirection}
							variants={cardVariants}
							initial="hidden"
							animate="visible"
							exit="exit"
							className="absolute inset-0 w-full h-full"
						>
							<SwipeCard
								profile={profiles[0]}
								onSwipe={handleSwipe}
							/>
						</motion.div>
					) : (
						<div className="text-center text-white z-20">
							{/* Empty state content */}
							<h2>No more profiles</h2>
						</div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default Dashboard;
