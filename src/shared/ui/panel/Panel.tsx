import { clsx } from "clsx";
import type { ReactNode } from "react";

type PanelVariant = "default" | "muted";
type PanelPadding = "normal" | "compact";

type PanelProps = {
	children: ReactNode;
	className?: string;
	variant?: PanelVariant;
	padding?: PanelPadding;
};

export function Panel({
	children,
	className,
	variant = "default",
	padding = "normal",
}: PanelProps) {
	const panelClassName = clsx(
		"rounded-md border border-border shadow-xs",
		variant === "default" && "bg-surface",
		variant === "muted" && "bg-surface-muted border-border-muted opacity-70",
		padding === "normal" && "p-6",
		padding === "compact" && "p-4",
		className,
	);

	return <div className={panelClassName}>{children}</div>;
}
