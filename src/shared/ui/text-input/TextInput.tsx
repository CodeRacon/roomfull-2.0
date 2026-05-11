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
		"w-full rounded-md border bg-surface px-3 py-2 text-sm text-text shadow-xs transition-colors placeholder:text-muted",
		"focus-visible:outline-1",
		!invalid &&
			"focus-visible:outline-focus border-border hover:border-primary",
		invalid &&
			"border-danger-text focus-visible:outline-danger-text bg-danger-bg!",
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
