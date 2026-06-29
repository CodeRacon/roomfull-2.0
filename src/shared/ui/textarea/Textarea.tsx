import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
	invalid?: boolean;
};

export function Textarea({
	disabled,
	invalid = false,
	className,
	...props
}: TextareaProps) {
	const textareaClassName = clsx(
		"min-h-40 w-full resize-y border-2 bg-background px-3 py-2 text-sm font-semibold leading-6 text-text transition-colors placeholder:text-muted",
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
		<textarea
			disabled={disabled}
			aria-invalid={invalid || undefined}
			className={textareaClassName}
			{...props}
		/>
	);
}
