import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
	variant?: ButtonVariant;
};

export function Button({
	variant = "primary",
	className,
	disabled,
	...props
}: ButtonProps) {
	const buttonClassName = clsx(
		"inline-flex min-h-10 items-center justify-center px-4 py-2 text-sm font-black transition-colors",
		"cursor-pointer touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
		variant === "primary" &&
			"bg-primary text-primary-soft hover:bg-primary-hover",
		variant === "secondary" &&
			"border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-soft",
		disabled && "disabled:cursor-not-allowed disabled:opacity-60",
		className,
	);

	return (
		<button
			type="button"
			disabled={disabled}
			className={buttonClassName}
			{...props}
		></button>
	);
}
