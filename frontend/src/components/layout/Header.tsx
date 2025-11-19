import { useState } from "react";
import { GithubIcon } from "../ui/GithubIcon";
import { MenuIcon } from "../ui/MenuIcon";
import { CloseIcon } from "../ui/CloseIcon";


function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	// Navigation links data
	const navLinks = [
		{ name: "HOME", href: "home" },
		{ name: "FEATURES", href: "features" },
		{ name: "ABOUT", href: "about" },
		{ name: "CONTACT", href: "contact" },
	];
	return (
		<>
			{/* Header Navigation */}
			<header className="absolute top-0 left-0 right-0 z-20 p-4 md:px-10">
				<nav className="flex items-center justify-between container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					{/* Logo */}
					<div className="shrink-0">
						<GithubIcon className="w-10 h-10 text-white" />
					</div>

					{/* Desktop Nav Links */}
					<div className="hidden md:flex items-center gap-8">
						{navLinks.map((link) => (
							<a
								key={link.name}
								href={link.href}
								className="text-sm font-medium transition-colors hover:text-purple-300"
							>
								{link.name}
							</a>
						))}
					</div>

					{/* Mobile Menu Button */}
					<button
						className="md:hidden z-30" // z-30 to be above the overlay
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						aria-label="Toggle menu"
					>
						{isMenuOpen ? (
							<CloseIcon className="w-8 h-8" />
						) : (
							<MenuIcon className="w-8 h-8" />
						)}
					</button>
				</nav>
			</header>
			{/* Mobile Menu Overlay */}
			<nav
				className={`fixed inset-0 z-10 flex flex-col items-center justify-center gap-10 bg-gradient-custom transition-transform duration-300 ease-in-out md:hidden ${
					isMenuOpen ? "translate-x-0" : "translate-x-full"
				}`}
			>
				{navLinks.map((link) => (
					<a
						key={link.name}
						href={link.href}
						className="text-3xl font-medium transition-colors hover:text-purple-300"
						onClick={() => setIsMenuOpen(false)} // Close menu on link click
					>
						{link.name}
					</a>
				))}
			</nav>
		</>
	);
}

export default Header;
