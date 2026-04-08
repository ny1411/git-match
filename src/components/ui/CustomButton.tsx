import React from "react";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
	ariaLabel?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
	children,
	className,
	ariaLabel,
	...props
}) => {
	return (
		<button
			{...props}
			aria-label={ariaLabel}
			className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/20 backdrop-blur-md shadow-lg transition-all hover:scale-110 ${className } `}
		>
			{children}
		</button>
	);
};
