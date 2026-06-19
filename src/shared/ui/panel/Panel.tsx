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
		"border-2 border-primary/35",
		variant === "default" && "bg-background",
		variant === "muted" &&
			"border-dashed border-primary/30 bg-primary/5 text-muted",
		padding === "normal" && "p-6",
		padding === "compact" && "p-4",
		className,
	);

	return <div className={panelClassName}>{children}</div>;
}
