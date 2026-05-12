import { clsx } from "clsx";
import type { ReactNode } from "react";

type BadgeVariant = "neutral" | "success" | "warning" | "danger";

type BadgeProps = {
	children: ReactNode;
	className?: string;
	variant?: BadgeVariant;
};

export function Badge({
	children,
	className,
	variant = "neutral",
}: BadgeProps) {
	const badgeClassName = clsx(
		"inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium shadow-xs",
		variant === "neutral" && "bg-primary-soft text-text",
		variant === "success" && "bg-success-bg text-success-text",
		variant === "warning" && "bg-warning-bg text-warning-text",
		variant === "danger" && "bg-danger-bg text-danger-text",
		className,
	);

	return <span className={badgeClassName}>{children}</span>;
}
