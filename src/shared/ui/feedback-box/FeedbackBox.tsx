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
		"w-full border-2 px-4 py-3 text-sm font-semibold leading-6",
		!title && "h-fit leading-4",
		variant === "info" && "border-primary bg-primary/10 text-primary",
		variant === "empty" &&
			"border-dashed border-primary/40 bg-background text-muted",
		variant === "success" &&
			"border-success-text bg-success-bg text-success-text",
		variant === "warning" &&
			"border-warning-text bg-warning-bg text-warning-text",
		variant === "error" && "border-danger-text bg-danger-bg text-danger-text",
		className,
	);

	return (
		<div className={feedbackBoxClassName}>
			{title && <p className="font-black">{title}</p>}
			<div>{children}</div>
		</div>
	);
}
