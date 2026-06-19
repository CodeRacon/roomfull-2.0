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
	"block px-5 py-4 text-base font-black text-primary transition-colors hover:bg-primary hover:text-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export function Menu({ className, ...props }: MenuProps) {
	return (
		<div
			role="menu"
			className={clsx(
				"border-2 border-primary bg-background p-0 text-text shadow-none text-shadow-none",
				className,
			)}
			{...props}
		/>
	);
}

export function MenuHeader({ children, className }: MenuHeaderProps) {
	return (
		<div
			className={clsx(
				"border-primary border-y-2 px-5 py-4 first:border-t-0",
				className,
			)}
		>
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
			className="block w-full cursor-not-allowed px-5 py-4 text-left text-base font-black text-muted"
		>
			{children}
		</button>
	);
}
