import { useState, type ChangeEvent, type FC } from "react";
import BgGradient from "../components/ui/BgGradient";
import { InputField } from "../components/ui/InputField";

const Profile: FC = () => {
	function calculateAge(dobString: string): number {
		const dob = new Date(dobString); // "MM/DD/YYYY"
		const today = new Date();

		let age = today.getFullYear() - dob.getFullYear();
		const monthDiff = today.getMonth() - dob.getMonth();
		const dayDiff = today.getDate() - dob.getDate();

		if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
			age--;
		}

		return age;
	}

	const [profileData, setProfileData] = useState({
		fullName: "Jane Doe",
		role: "Frontend Developer",
		location: "NYC",
		about: "I love coding and collaborating on open source projects!",
		dob: "10/06/2002",
	});
	const age = calculateAge(profileData.dob);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setProfileData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const sampleImage =
		"https://images.unsplash.com/photo-1554083021-dd6b85a6d423?q=80&w=150&h=150&fit=crop";

	return (
		<div className="w-screen relative flex flex-col md:justify-center items-center min-h-screen text-white overflow-x-hidden">
			<BgGradient />

			<div className="w-full max-w-7xl my-4 px-4 md:px-8">
				{/* Main Card */}
				<div className="grid grid-cols-1 md:grid-cols-5 bg-white/5 backdrop-blur-sm rounded-4xl shadow-2xl border border-white/10 overflow-hidden">
					{/* LEFT: FORM SECTION */}
					<div className="p-6 md:p-10 col-span-1 md:col-span-3">
						<h2 className="text-2xl font-bold text-white mb-6 pb-3">
							Profile Setting
						</h2>

						<div className="grid grid-cols-3 gap-6">
							{/* Input Column */}
							<div className="col-span-3 md:col-span-2 space-y-4">
								<InputField
									onChange={handleChange}
									name="fullName"
									label="Full Name"
									value={profileData.fullName}
								/>
								<InputField
									onChange={handleChange}
									name="age"
									label="Age"
									value={String(age)}
									disabled
									readOnly
									className="cursor-not-allowed"
									type="number"
								/>
								<InputField
									onChange={handleChange}
									name="role"
									label="Role/Area of interest"
									value={profileData.role}
								/>
								<InputField
									onChange={handleChange}
									name="githubURL"
									label="Github Profile Link (Authentication required)"
									value="https://github.com/janedoe"
								/>
								<InputField
									onChange={handleChange}
									name="location"
									label="Location"
									value={profileData.location}
								/>
								<InputField
									onChange={handleChange}
									name="about"
									label="About me"
									value={profileData.about}
								/>
								<InputField
									onChange={handleChange}
									name="dob"
									label="DOB"
									value={profileData.dob}
									type="date"
								/>
								<InputField
									onChange={handleChange}
									name="others"
									label="Others"
								/>
							</div>

							{/* Upload Column */}
							<div className="col-span-3 md:col-span-1 flex flex-col items-center">
								<img
									src={sampleImage}
									alt="Upload Preview"
									className="w-28 h-28 rounded-full object-cover border-4 border-purple-500/50 mb-3"
								/>
								<button className="text-sm text-gray-300 hover:text-white transition-colors">
									Upload Image
								</button>
							</div>
						</div>

						{/* Save Button */}
						<div className="mt-8 pt-4">
							<button className="w-40 py-3 rounded-full bg-linear-to-r from-purple-600 to-fuchsia-500 text-white font-bold tracking-wider shadow-lg shadow-purple-500/40 hover:scale-105 transition-transform">
								SAVE
							</button>
						</div>
					</div>

					{/* RIGHT: PREVIEW SECTION */}
					<div className="hidden md:flex col-span-1 md:col-span-2 relative min-h-[300px] md:min-h-full">
						<img
							src="https://images.unsplash.com/photo-1605776332618-6f0b905be303?q=80&w=1500&auto=format&fit=crop"
							alt="Profile Preview Background"
							className="absolute inset-0 w-full h-full object-cover opacity-90"
						/>

						{/* Overlay */}
						<div className="absolute inset-0 bg-black/30 backdrop-blur-xs p-6 flex flex-col justify-end">
							{/* Top Info Bar */}
							<div className="flex items-center justify-between bg-black/45 p-3 rounded-lg mb-4">
								<div className="flex items-center">
									<img
										src={sampleImage}
										alt="User Profile"
										className="w-12 h-12 rounded-full object-cover mr-3"
									/>
									<div className="text-sm">
										<p className="font-bold text-white">
											{profileData.fullName}, {age}
										</p>
										<p className="text-gray-300">
											Frontend Developer, NYC
										</p>
									</div>
								</div>
								<button className="text-sm text-purple-300 font-medium hover:text-white transition-colors">
									View Gallery
								</button>
							</div>

							{/* Summary Block */}
							<div className="bg-black/45 p-4 rounded-lg">
								<div className="text-sm text-white mb-4 space-y-1">
									<p className="text-purple-300">
										&lt;About me{" "}
									</p>
									<p className="pl-4 text-xs text-gray-200 line-clamp-2">
										value="{profileData.about}"
									</p>
									<p className="text-purple-300">&gt;</p>
								</div>

								{/* GitHub Stats */}
								<div className="flex items-center gap-2 mb-4">
									<div className="bg-purple-500/80 px-2 py-0.5 rounded text-xs font-medium">
										<span className="text-white mr-1">
											31
										</span>
										Repos
									</div>
									<div className="bg-purple-500/80 px-2 py-0.5 rounded text-xs font-medium">
										<span className="text-white mr-1">
											78
										</span>
										Commits
									</div>
								</div>

								{/* Languages */}
								<p className="text-sm text-purple-300 mb-2">
									# Top Languages
								</p>
								<div className="flex flex-wrap gap-2">
									{[
										"JavaScript",
										"Python",
										"HTML",
										"TypeScript",
									].map((lang) => (
										<span
											key={lang}
											className="bg-purple-700/80 text-xs px-2 py-1 rounded-full text-white"
										>
											{lang}
										</span>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
