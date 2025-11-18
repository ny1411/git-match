import { type FC } from "react";
import BgGradient from "../components/ui/BgGradient";
import GitMatchHeroImageURL from "../assets/git-match-hero-img.png";
import Header from "../components/layout/Header";

const LandingPage: FC = () => {
	// Handler for the "Get Started" button
	const onGetStarted = () => {
		console.log("Get Started Clicked");
	};

	return (
		<>
			{/* Main Page Container */}
			<div className="w-screen relative flex flex-col min-h-screen text-white overflow-x-hidden">
				<BgGradient />
				<Header />
				{/* Main Content */}
				<main className="flex-1 flex items-center justify-center p-4 pt-28 md:pt-16">
					<div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-10">
						{/* Left Side: Hero Text & CTA */}
						<div className="flex flex-col items-center md:items-start text-center md:text-left">
							{/* Title */}
							<h1 className="text-7xl lg:text-9xl font-pixel text-white leading-tight">
								GIT MATCH
							</h1>

							{/* Subtitle */}
							<p className="text-lg md:text-4xl font-pixel text-gray-300 mb-10 max-w-lg">
								Find your perfect one to commit...
							</p>

							{/* CTA Button */}
							<div className="relative w-full max-w-sm h-16 bg-white rounded-full">
								{/* Gradient Button - Positioned absolutely to create the 'pill inside pill' look */}
								<button
									onClick={onGetStarted}
									className="absolute top-1.5 left-1.5 bottom-1.5 w-[55%] 
                                             bg-gradient-to-tr from-pink-500 to-purple-700
                                             rounded-full text-white font-bold text-xl
                                             flex items-center justify-center cursor-pointer
                                             transition-transition duration-300 hover:scale-105"
								>
									Get Started
								</button>
							</div>

							{/* Tech Icons */}
							<div className="flex mt-12 md:mt-16 space-x-8 md:space-x-12 items-center">
								{/* Floating Side Circles (Visible on desktop) */}
								<div className="hidden md:flex flex-col gap-6">
									<div className="w-5 h-5 bg-white rounded-full opacity-30"></div>
									<div className="w-5 h-5 bg-white rounded-full opacity-30"></div>
									<div className="w-5 h-5 bg-white rounded-full opacity-30"></div>
								</div>
							</div>
						</div>

						{/* Right Side: Illustration */}
						<div className="relative flex items-center justify-center">
							<img
								// Using a placeholder as the user did not provide the asset
								src={GitMatchHeroImageURL}
								alt="Couple holding hands"
								className="w-svw" // Responsive image size
								onError={(e) =>
									((e.target as HTMLImageElement).src =
										"https://placehold.co/500x500/FFFFFF/000000?text=Illustration_Fallback")
								}
							/>
						</div>
					</div>
				</main>
			</div>
		</>
	);
};

export default LandingPage;
