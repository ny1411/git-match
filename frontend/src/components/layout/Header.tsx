import { useState, type FC, type SVGProps } from "react";

// --- SVG Icon Components ---
// GitHub Logo
const GithubIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
	<svg {...props} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path
			fillRule="evenodd"
			d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.488.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.951 0-1.093.39-1.988 1.03-2.69-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.82c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.702 1.03 1.597 1.03 2.69 0 3.849-2.339 4.695-4.566 4.942.359.309.678.92.678 1.85 0 1.338-.012 2.419-.012 2.747 0 .267.18.577.688.48A10.001 10.001 0 0022 12C22 6.477 17.523 2 12 2z"
			clipRule="evenodd"
		/>
	</svg>
);

// Menu Icon (Hamburger)
const MenuIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
	<svg
		{...props}
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={1.5}
		stroke="currentColor"
		aria-hidden="true"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
		/>
	</svg>
);

// Close Icon (X)
const CloseIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
	<svg
		{...props}
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={1.5}
		stroke="currentColor"
		aria-hidden="true"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M6 18L18 6M6 6l12 12"
		/>
	</svg>
);

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
