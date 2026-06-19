import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

type TextInputProps = ComponentPropsWithoutRef<"input"> & {
	invalid?: boolean;
};

export function TextInput({
	disabled,
	invalid = false,
	type = "text",
	className,
	...props
}: TextInputProps) {
	const textInputClassName = clsx(
		"min-h-11 w-full border-2 bg-background px-3 py-2 text-sm font-semibold text-text transition-colors placeholder:text-muted",
		"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
		!invalid &&
			"border-primary/40 hover:border-primary disabled:border-primary/20 disabled:hover:border-primary/20",
		invalid &&
			"border-danger-text bg-danger-bg! text-danger-text placeholder:text-danger-text/65 focus-visible:outline-danger-text",
		disabled &&
			"disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted disabled:opacity-70",
		className,
	);

	return (
		<input
			type={type}
			disabled={disabled}
			aria-invalid={invalid || undefined}
			className={textInputClassName}
			{...props}
		/>
	);
}
