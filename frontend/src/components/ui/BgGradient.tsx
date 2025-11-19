export default function BgGradient() {
	return (
		<div className="fixed w-screen h-screen overflow-hidden bg-black -z-10">
			{/* Deep Purple */}
			<div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-[#2A006B] blur-[200px] rounded-full opacity-80 animate-pulse"></div>
			{/* Magenta Blob */}
			<div className="absolute top-10 right-0 w-[700px] h-[700px] bg-[#A100B8] blur-[250px] rounded-full opacity-80"></div>
			{/* Dark Red Blob */}
			<div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-[#5A0020] blur-[200px] rounded-full opacity-30"></div>
			{/* Deep Navy */}
			<div className="absolute bottom-0 right-20 w-[700px] h-[700px] bg-[#070014] blur-[300px] rounded-full opacity-90 animate-pulse"></div>
			{/* Bright Purple Edge */}
			<div className="absolute top-1/2 left-1/3 w-[900px] h-[900px] bg-[#7F00A6] blur-[300px] rounded-full opacity-50"></div>
		</div>
	);
}
