import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type AnchorVariant = "primary" | "secondary";

type AnchorProps = ComponentPropsWithoutRef<typeof Link> & {
	variant?: AnchorVariant;
};

export function Anchor({
	variant = "primary",
	className,
	...props
}: AnchorProps) {
	const anchorClassName = clsx(
		"inline-flex items-center text-sm font-medium transition-colors",
		variant === "primary" &&
			" justify-center rounded-md px-4 py-2 bg-secondary text-white hover:bg-secondary-hover",
		"focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2",
		variant === "secondary" && " text-secondary",
		className,
	);

	return <Link className={anchorClassName} {...props} />;
}
