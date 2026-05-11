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
		"inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
		"focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2",
		variant === "primary" && "bg-primary text-white hover:bg-primary-hover",
		variant === "secondary" &&
			"border border-border bg-surface text-text hover:bg-surface-muted",
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
