import { motion, useMotionValue, useTransform } from "framer-motion";
import { Heart, MapPin, MessageCircle, X } from "lucide-react";
import type { Profile } from "../../types/profile";
import { CustomButton } from "../ui/CustomButton";

const SwipeCard = ({
	profile,
	onSwipe,
}: {
	profile: Profile;
	onSwipe: (dir: "left" | "right") => void;
}) => {
	const x = useMotionValue(0);
	const rotate = useTransform(x, [-200, 200], [-25, 25]);

	const handleDragEnd = (_: any, info: any) => {
		if (info.offset.x > 120) onSwipe("right");
		else if (info.offset.x < -120) onSwipe("left");
		else x.set(0);
	};

	const currentProfile = profile; // For clarity in JSX

	return (
		<motion.div
			drag="x"
			style={{ x, rotate }}
			dragConstraints={{ left: 0, right: 0 }}
			onDragEnd={handleDragEnd}
			className="absolute inset-0 overflow-hidden cursor-grab border-2 border-zinc-50/20 backdrop-blur-md drop-shadow-xl rounded-3xl shadow-xl"
		>
			<img
				src={profile.image}
				alt={profile.name}
				className="w-full h-full object-cover pointer-events-none select-none"
				draggable="false"
			/>
			{/* Gradient Overlay for Text Visibility */}
			<div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent"></div>

			{/* Content Overlay */}
			<div className="absolute inset-0 p-6 flex flex-row items-end justify-between">
				{/* Left Side: Profile Info */}
				<div className="flex-1 pr-4 mb-4 select-none">
					{/* Location Tag */}
					<div className="flex items-center gap-1 bg-white/20 backdrop-blur-md w-fit px-2 py-1 rounded-full mb-3">
						<MapPin size={12} className="text-white" />
						<span className="text-[10px] font-medium text-white uppercase tracking-wide">
							{currentProfile.location}
						</span>
					</div>
					{/* Name & Age */}
					<h2 className="text-4xl font-semibold text-white leading-tight">
						{currentProfile.name},{" "}
						<span className="text-white font-semibold">
							{currentProfile.age}
						</span>
					</h2>
					{/* Interests */}
					<div className="flex flex-wrap gap-2 mt-3">
						{currentProfile.interests
							.slice(0, 3)
							.map((interest) => (
								<span
									key={interest}
									className="px-3 py-1 rounded-full border border-white/30 text-xs text-white/90 bg-black/20"
								>
									{interest}
								</span>
							))}
					</div>
				</div>
				{/* Right Side: Action Buttons (Floating) */}
				<div className="flex flex-col gap-4 mb-2">
					{/* Comment Button */}
					<CustomButton className="bg-white/10 text-white hover:bg-blue-600/70 ">
						<MessageCircle size={22} />
					</CustomButton>
					{/* Like Button */}
					<CustomButton
						onClick={() => {
							x.set(200);
							onSwipe("right");
						}}
						className="bg-linear-to-tr from-pink-500 to-purple-600 text-white shadow-lg shadow-purple-500/40"
					>
						<Heart size={22} fill="white" />
					</CustomButton>
					{/* Dismiss Button */}
					<CustomButton
						onClick={() => {
							x.set(-200);
							onSwipe("left");
						}}
						className="bg-black/40 text-white  hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 shadow-lg"
					>
						<X size={24} />
					</CustomButton>
				</div>
			</div>
		</motion.div>
	);
};

export default SwipeCard;
