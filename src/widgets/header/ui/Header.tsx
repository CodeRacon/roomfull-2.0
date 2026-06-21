"use client";

import { clsx } from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	type ReactElement,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { useSession } from "@/entities/session";
import { LanguageSwitcher } from "@/features/language/switch-language";
import type { Dictionary, Locale } from "@/shared/i18n";
import { appRoutes } from "@/shared/routing";
import {
	Button,
	Menu,
	MenuButtonItem,
	MenuHeader,
	MenuLinkItem,
} from "@/shared/ui";

type HeaderProps = {
	copy: Dictionary["navigation"];
	languageSwitcherCopy: Dictionary["languageSwitcher"];
	locale: Locale;
};

export function Header({
	copy,
	languageSwitcherCopy,
	locale,
}: HeaderProps): ReactElement {
	const router = useRouter();
	const { status, user, endSession } = useSession();
	const headerRef = useRef<HTMLElement>(null);
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const isAuthenticated = status === "authenticated";
	const isAnonymous = status === "anonymous";
	const isAdmin = user?.role === "ADMIN";
	const isCustomer = user?.role === "CUSTOMER";

	const closeMenus = useCallback((): void => {
		setIsProfileMenuOpen(false);
		setIsMobileMenuOpen(false);
	}, []);

	function handleLogout(): void {
		endSession();
		closeMenus();
		router.replace(appRoutes.home(locale));
	}

	useEffect(() => {
		if (!isProfileMenuOpen && !isMobileMenuOpen) {
			return;
		}

		function handleKeyDown(event: KeyboardEvent): void {
			if (event.key === "Escape") {
				closeMenus();
			}
		}

		function handlePointerDown(event: PointerEvent): void {
			const eventTarget = event.target;

			if (
				eventTarget instanceof Node &&
				!headerRef.current?.contains(eventTarget)
			) {
				closeMenus();
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("pointerdown", handlePointerDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("pointerdown", handlePointerDown);
		};
	}, [closeMenus, isMobileMenuOpen, isProfileMenuOpen]);

	const focusClass =
		"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
	const menuTriggerClass =
		"border-primary! bg-background! text-primary! hover:bg-primary! hover:text-on-primary!";
	const menuTriggerOpenClass = "bg-primary! text-on-primary!";

	return (
		<header
			ref={headerRef}
			className="app-header sticky top-0 z-30 flex h-[var(--app-header-height)] w-full shrink-0 items-center justify-center px-4 md:px-6"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 z-0 grid grid-cols-4"
			>
				<span className="border-background border-r bg-unit-hot-desk/15" />
				<span className="border-background border-r bg-unit-booth/15" />
				<span className="border-background border-r bg-unit-team-room/15" />
				<span className="bg-unit-meeting-room/15" />
			</div>
			<nav className="relative z-10 flex h-full w-full max-w-7xl items-center justify-between gap-8">
				<Link
					href={appRoutes.home(locale)}
					aria-label={copy.homeAriaLabel}
					className={clsx(
						focusClass,
						"inline-flex shrink-0 items-center gap-3 text-text transition-colors hover:text-accent",
					)}
				>
					<Image
						src="/logo/roomfull-mark-circle.svg"
						alt=""
						aria-hidden="true"
						width={80}
						height={80}
						className="size-18 shrink-0 md:size-20"
					/>
				</Link>
				{!isAdmin && (
					<div className="hidden items-center gap-6 md:flex">
						<Link
							href={appRoutes.bookingOptions(locale)}
							className={clsx(
								focusClass,
								"type-header-link text-text transition-colors hover:text-accent",
							)}
						>
							{copy.bookingOptions}
						</Link>
					</div>
				)}
				<div className="type-header-link hidden items-center justify-center gap-5 text-text md:flex">
					{isAuthenticated && (
						<>
							{isCustomer && (
								<Link
									href={appRoutes.myBookings(locale)}
									onClick={closeMenus}
									className={clsx(
										focusClass,
										"transition-colors hover:text-accent",
									)}
								>
									{copy.myBookings}
								</Link>
							)}
							{isAdmin && (
								<Link
									href={appRoutes.admin(locale)}
									onClick={closeMenus}
									className={clsx(
										focusClass,
										"transition-colors hover:text-accent",
									)}
								>
									{copy.admin}
								</Link>
							)}
							<div className="relative">
								<Button
									variant="secondary"
									className={clsx(
										menuTriggerClass,
										isProfileMenuOpen && menuTriggerOpenClass,
									)}
									aria-haspopup="menu"
									aria-expanded={isProfileMenuOpen}
									onClick={() =>
										setIsProfileMenuOpen((currentValue) => {
											setIsMobileMenuOpen(false);
											return !currentValue;
										})
									}
								>
									{copy.profile}
								</Button>
								{isProfileMenuOpen && (
									<Menu className="absolute right-0 z-10 mt-2 min-w-56">
										<MenuHeader>
											<p className="text-base font-black">
												{user?.name ?? copy.profile}
											</p>
											{user?.email && (
												<p className="mt-1 truncate text-sm font-semibold text-muted">
													{user.email}
												</p>
											)}
										</MenuHeader>
										<MenuLinkItem
											href={appRoutes.account(locale)}
											onClick={closeMenus}
										>
											{copy.account}
										</MenuLinkItem>
										{isCustomer && (
											<MenuLinkItem
												href={appRoutes.contact(locale)}
												onClick={closeMenus}
											>
												{copy.contact}
											</MenuLinkItem>
										)}
										<MenuButtonItem onClick={handleLogout}>
											{copy.signOut}
										</MenuButtonItem>
									</Menu>
								)}
							</div>
						</>
					)}
					{isAnonymous && (
						<>
							<Link
								href={appRoutes.login(locale)}
								className={clsx(
									focusClass,
									"transition-colors hover:text-accent",
								)}
							>
								{copy.signIn}
							</Link>
							<Link
								href={appRoutes.register(locale)}
								className={clsx(
									focusClass,
									"transition-colors hover:text-accent",
								)}
							>
								{copy.signUp}
							</Link>
						</>
					)}
					<LanguageSwitcher
						activeLocale={locale}
						ariaLabel={languageSwitcherCopy.label}
						labels={{
							de: languageSwitcherCopy.de,
							en: languageSwitcherCopy.en,
						}}
					/>
				</div>
				<Button
					variant="secondary"
					className={clsx(
						menuTriggerClass,
						isMobileMenuOpen && menuTriggerOpenClass,
						"md:hidden",
					)}
					aria-haspopup="menu"
					aria-expanded={isMobileMenuOpen}
					aria-label={copy.mainMenuOpen}
					onClick={() =>
						setIsMobileMenuOpen((currentValue) => {
							setIsProfileMenuOpen(false);
							return !currentValue;
						})
					}
				>
					{copy.mainMenu}
				</Button>
			</nav>
			{isMobileMenuOpen && (
				<Menu className="absolute inset-x-4 top-full z-20 mt-2 md:hidden">
					{!isAdmin && (
						<MenuLinkItem
							href={appRoutes.bookingOptions(locale)}
							onClick={closeMenus}
						>
							{copy.bookingOptions}
						</MenuLinkItem>
					)}
					{isAuthenticated && (
						<>
							{isCustomer && (
								<MenuLinkItem
									href={appRoutes.myBookings(locale)}
									onClick={closeMenus}
								>
									{copy.myBookings}
								</MenuLinkItem>
							)}
							{isAdmin && (
								<MenuLinkItem
									href={appRoutes.admin(locale)}
									onClick={closeMenus}
								>
									{copy.adminDashboard}
								</MenuLinkItem>
							)}
							<MenuHeader>
								<p className="text-base font-black">
									{user?.name ?? copy.profile}
								</p>
								{user?.email && (
									<p className="mt-1 truncate text-sm font-semibold text-muted">
										{user.email}
									</p>
								)}
							</MenuHeader>
							<MenuLinkItem
								href={appRoutes.account(locale)}
								onClick={closeMenus}
							>
								{copy.account}
							</MenuLinkItem>
							{isCustomer && (
								<MenuLinkItem
									href={appRoutes.contact(locale)}
									onClick={closeMenus}
								>
									{copy.contact}
								</MenuLinkItem>
							)}
							<MenuButtonItem onClick={handleLogout}>
								{copy.signOut}
							</MenuButtonItem>
						</>
					)}
					{isAnonymous && (
						<>
							<MenuLinkItem href={appRoutes.login(locale)} onClick={closeMenus}>
								{copy.signIn}
							</MenuLinkItem>
							<MenuLinkItem
								href={appRoutes.register(locale)}
								onClick={closeMenus}
							>
								{copy.signUp}
							</MenuLinkItem>
						</>
					)}
					<MenuHeader>
						<LanguageSwitcher
							activeLocale={locale}
							ariaLabel={languageSwitcherCopy.label}
							labels={{
								de: languageSwitcherCopy.de,
								en: languageSwitcherCopy.en,
							}}
						/>
					</MenuHeader>
				</Menu>
			)}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-x-0 bottom-0 grid h-1 grid-cols-4"
			>
				<span className="bg-unit-hot-desk" />
				<span className="bg-unit-booth" />
				<span className="bg-unit-team-room" />
				<span className="bg-unit-meeting-room" />
			</div>
		</header>
	);
}
