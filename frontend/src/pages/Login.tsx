import { useState, type FC } from "react";
import { GithubIcon } from "../components/ui/GithubIcon";
import { InputField } from "../components/ui/InputField";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Login: FC = () => {
	const [loginMode, setLoginMode] = useState("sign-up");
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		githubProfileUrl: "",
		password: "",
	});

	const navigate = useNavigate();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const { signup, login } = useAuth();

	const handleLogin = async () => {
		const result = await login(formData.email, formData.password);
		console.log(result);
		
	};
	const handleSignUp = async () => {
		const dataToSend = {
			fullName: formData.fullName,
			email: formData.email,
			githubProfileUrl: formData.githubProfileUrl,
			password: formData.password,
		};
		const signupResult = await signup(dataToSend);
		console.log(signupResult);

		if (signupResult.success) {
			navigate("/onboarding");
		}
	};

	return (
		<div className="min-h-screen w-full bg-[#0f0a1e] flex items-center justify-center p-4">
			{/* Card Container */}
			<div className="w-full max-w-5xl h-[85vh] bg-[#1c1b2e]/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/5">
				{/* Left Side: Form */}
				<div className="w-full md:w-5/12 p-8 md:p-12 flex flex-col relative">
					{/* Background Gradient for Left Side (Subtle) */}
					<div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-purple-900/20 via-transparent to-transparent pointer-events-none"></div>

					{/* Toggle Pill */}
					<div className="relative z-10 flex w-full max-w-[280px] mx-auto mb-16 bg-white rounded-full p-1 h-14 shadow-lg">
						<button
							type="button"
							onClick={() => setLoginMode("sign-up")}
							className={`rounded-full w-1/2 text-gray-500 font-bold text-sm tracking-wide hover:text-gray-800 transition-colors duration-300 ${
								loginMode === "sign-up"
									? "bg-[#8b2fc9] text-white shadow-md"
									: "bg-transparent text-gray-500"
							}`}
						>
							SIGN UP
						</button>
						<button
							type="button"
							onClick={() => setLoginMode("login")}
							className={` rounded-full w-1/2 text-gray-500 font-bold text-sm tracking-wide hover:text-gray-800 transition-colors duration-300 ${
								loginMode === "login"
									? "bg-[#8b2fc9] text-white shadow-md"
									: "bg-transparent text-gray-500"
							}`}
						>
							LOGIN
						</button>
					</div>

					{loginMode === "sign-up" && (
						<div>
							{/* Form Fields */}
							<div className="flex-1 flex flex-col justify-center space-y-2 max-w-xs mx-auto w-full">
								<InputField
									label="Full Name"
									name="fullName"
									value={formData.fullName}
									onChange={handleChange}
								/>
								<InputField
									label="Email"
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
								/>
								<div className="flex items-start gap-4">
									<InputField
										label="Github Profile URL"
										name="githubProfileUrl"
										value={formData.githubProfileUrl}
										onChange={handleChange}
									/>
								</div>
								<InputField
									label="Password"
									type="password"
									name="password"
									value={formData.password}
									onChange={handleChange}
								/>
							</div>

							{/* Action Button */}
							<div className="mt-12 flex justify-center">
								<button
									onClick={handleSignUp}
									className="w-full max-w-[200px] py-3 rounded-full bg-linear-to-r from-[#a82ee6] to-[#7125d8] text-white font-bold tracking-wider shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform"
								>
									SIGN UP
								</button>
							</div>
						</div>
					)}
					{loginMode === "login" && (
						<div>
							{/* Form Fields */}
							<div className="flex-1 flex flex-col justify-center space-y-2 max-w-xs mx-auto w-full">
								<InputField
									label="Email"
									name="email"
									type="email"
									value={formData.email}
									onChange={handleChange}
								/>
								<InputField
									label="Password"
									name="password"
									type="password"
									value={formData.password}
									onChange={handleChange}
								/>
							</div>

							{/* Action Button */}
							<div className="mt-12 flex justify-center">
								<button
									onClick={handleLogin}
									className="w-full max-w-[200px] py-3 rounded-full bg-linear-to-r from-[#a82ee6] to-[#7125d8] text-white font-bold tracking-wider shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform"
								>
									LOGIN
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Right Side: Image & Branding */}
				<div className="relative w-full md:w-7/12 h-full hidden md:block">
					{/* Background Image */}
					<div className="absolute inset-0">
						<img
							src="https://images.unsplash.com/photo-1609464527830-881cc93789ef?q=80&w=2128&auto=format&fit=crop"
							alt="Developers coding"
							className="w-full h-full object-cover opacity-80"
						/>
						{/* Overlay Gradient to match the theme */}
						<div className="absolute inset-0 bg-linear-to-t from-[#0f0a1e]/80 via-transparent to-[#0f0a1e]/30 mix-blend-multiply"></div>
					</div>

					{/* Content Overlay */}
					<div className="absolute top-10 left-0 right-0 flex flex-col items-center text-center z-10">
						{/* Logo Area */}
						<div className="flex items-center gap-3 mb-1">
							<div className="relative">
								<div className="absolute inset-0 bg-white blur-xl opacity-20 rounded-full"></div>
								<GithubIcon className="w-12 h-12 text-white relative z-10" />
							</div>
							<h1 className="text-7xl text-white font-pixel tracking-widest drop-shadow-lg">
								GIT MATCH
							</h1>
						</div>
						<p className="text-gray-200 text-xl font-pixel tracking-wide opacity-90 drop-shadow-md">
							Find your perfect one to commit...
						</p>
					</div>

					{/* Photo Credit (Optional/From Image) */}
					<div className="absolute bottom-4 right-6 text-[10px] text-gray-400 opacity-60">
						Photo by Danilo Rios on Unsplash
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
