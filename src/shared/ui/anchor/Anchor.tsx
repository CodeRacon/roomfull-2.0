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
		"inline-flex min-h-10 items-center text-sm font-black transition-colors",
		variant === "primary" &&
			"justify-center bg-primary px-4 py-2 text-primary-soft hover:bg-primary-hover",
		"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
		variant === "secondary" &&
			"bg-primary/10 px-3 py-2 text-primary hover:bg-primary hover:text-primary-soft",
		className,
	);

	return <Link className={anchorClassName} {...props} />;
}
