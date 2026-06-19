import { clsx } from "clsx";
import type { ReactNode } from "react";

type BadgeVariant = "neutral" | "muted" | "success" | "warning" | "danger";

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
		"inline-flex h-fit w-fit shrink-0 items-center px-3 py-1.5 text-xs font-black leading-none",
		variant === "neutral" && "bg-primary/10 text-primary",
		variant === "muted" && "bg-surface-muted text-muted",
		variant === "success" && "bg-success-bg text-success-text",
		variant === "warning" && "bg-warning-bg text-warning-text",
		variant === "danger" && "bg-danger-bg text-danger-text",
		className,
	);

	return <span className={badgeClassName}>{children}</span>;
}
