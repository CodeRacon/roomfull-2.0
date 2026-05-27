import { clsx } from "clsx";
import type { ReactNode } from "react";

type FeedbackBoxVariant = "info" | "empty" | "success" | "warning" | "error";

type FeedbackBoxProps = {
	title?: ReactNode;
	children: ReactNode;
	variant?: FeedbackBoxVariant;
	className?: string;
};

export function FeedbackBox({
	title,
	children,
	className,
	variant = "info",
}: FeedbackBoxProps) {
	const feedbackBoxClassName = clsx(
		"w-full rounded-md border px-3 py-1 text-sm leading-6",
		!title && "h-fit leading-4",
		variant === "info" && "border-primary bg-primary-soft text-text",
		variant === "empty" && "border-dashed border-border px-4 py-2 text-muted",
		variant === "success" &&
			"border-success-text/20 bg-success-bg text-success-text",
		variant === "warning" &&
			"border-warning-text/20 bg-warning-bg text-warning-text",
		variant === "error" &&
			"border-danger-text/20 bg-danger-bg text-danger-text",
		className,
	);

	return (
		<div className={feedbackBoxClassName}>
			{title && <p className="font-medium">{title}</p>}
			<div>{children}</div>
		</div>
	);
}
