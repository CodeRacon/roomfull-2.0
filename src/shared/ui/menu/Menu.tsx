import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type MenuProps = ComponentPropsWithoutRef<"div">;

type MenuHeaderProps = {
	children: ReactNode;
	className?: string;
};

type MenuLinkItemProps = ComponentPropsWithoutRef<typeof Link>;

type MenuButtonItemProps = ComponentPropsWithoutRef<"button">;

type MenuDisabledItemProps = {
	children: ReactNode;
};

const menuItemClassName =
	"block rounded-md px-3 py-2 text-sm font-medium hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export function Menu({ className, ...props }: MenuProps) {
	return (
		<div
			role="menu"
			className={clsx(
				"rounded-md border border-border bg-surface p-2 text-text shadow-lg text-shadow-none",
				className,
			)}
			{...props}
		/>
	);
}

export function MenuHeader({ children, className }: MenuHeaderProps) {
	return (
		<div className={clsx("border-border border-b px-3 py-2", className)}>
			{children}
		</div>
	);
}

export function MenuLinkItem({ className, ...props }: MenuLinkItemProps) {
	return (
		<Link
			role="menuitem"
			className={clsx(menuItemClassName, className)}
			{...props}
		/>
	);
}

export function MenuButtonItem({
	className,
	type = "button",
	...props
}: MenuButtonItemProps) {
	return (
		<button
			type={type}
			role="menuitem"
			className={clsx(
				menuItemClassName,
				"w-full cursor-pointer text-left",
				className,
			)}
			{...props}
		/>
	);
}

export function MenuDisabledItem({ children }: MenuDisabledItemProps) {
	return (
		<button
			type="button"
			role="menuitem"
			disabled
			className="block w-full cursor-not-allowed rounded-md px-3 py-2 text-left text-sm font-medium text-muted"
		>
			{children}
		</button>
	);
}
