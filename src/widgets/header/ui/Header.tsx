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
import {
	Button,
	Menu,
	MenuButtonItem,
	MenuHeader,
	MenuLinkItem,
} from "@/shared/ui";

export function Header(): ReactElement {
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
		router.replace("/");
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
		"border-primary! bg-background! text-primary! hover:bg-primary! hover:text-primary-soft!";
	const menuTriggerOpenClass = "bg-primary! text-primary-soft!";

	return (
		<header
			ref={headerRef}
			className="sticky top-0 z-30 flex w-full items-center justify-center border-border border-b bg-background px-4 py-2.5 md:px-6"
		>
			<nav className="flex w-full max-w-7xl items-center justify-between gap-8">
				<Link
					href="/"
					aria-label="Zur Startseite"
					className={clsx(
						focusClass,
						"inline-flex shrink-0 items-center gap-3 text-text transition-colors hover:text-secondary",
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
							href="/booking-options"
							className={clsx(
								focusClass,
								"type-header-link text-text transition-colors hover:text-secondary",
							)}
						>
							Buchen
						</Link>
					</div>
				)}
				<div className="type-header-link hidden items-center justify-center gap-5 text-text md:flex">
					{isAuthenticated && (
						<>
							{isCustomer && (
								<Link
									href="/me/bookings"
									onClick={closeMenus}
									className={clsx(
										focusClass,
										"transition-colors hover:text-secondary",
									)}
								>
									Meine Buchungen
								</Link>
							)}
							{isAdmin && (
								<Link
									href="/admin"
									onClick={closeMenus}
									className={clsx(
										focusClass,
										"transition-colors hover:text-secondary",
									)}
								>
									Admin
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
									Profil
								</Button>
								{isProfileMenuOpen && (
									<Menu className="absolute right-0 z-10 mt-2 min-w-56">
										<MenuHeader>
											<p className="text-base font-black">
												{user?.name ?? "Profil"}
											</p>
											{user?.email && (
												<p className="mt-1 truncate text-sm font-semibold text-muted">
													{user.email}
												</p>
											)}
										</MenuHeader>
										<MenuLinkItem href="/me/account" onClick={closeMenus}>
											Mein Account
										</MenuLinkItem>
										<MenuButtonItem onClick={handleLogout}>
											Abmelden
										</MenuButtonItem>
									</Menu>
								)}
							</div>
						</>
					)}
					{isAnonymous && (
						<>
							<Link
								href="/login"
								className={clsx(
									focusClass,
									"transition-colors hover:text-secondary",
								)}
							>
								Einloggen
							</Link>
							<Link
								href="/register"
								className={clsx(
									focusClass,
									"transition-colors hover:text-secondary",
								)}
							>
								Registrieren
							</Link>
						</>
					)}
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
					aria-label="Hauptmenü öffnen"
					onClick={() =>
						setIsMobileMenuOpen((currentValue) => {
							setIsProfileMenuOpen(false);
							return !currentValue;
						})
					}
				>
					Menü
				</Button>
			</nav>
			{isMobileMenuOpen && (
				<Menu className="absolute inset-x-4 top-full z-20 mt-2 md:hidden">
					{!isAdmin && (
						<MenuLinkItem href="/booking-options" onClick={closeMenus}>
							Buchen
						</MenuLinkItem>
					)}
					{isAuthenticated && (
						<>
							{isCustomer && (
								<MenuLinkItem href="/me/bookings" onClick={closeMenus}>
									Meine Buchungen
								</MenuLinkItem>
							)}
							{isAdmin && (
								<MenuLinkItem href="/admin" onClick={closeMenus}>
									Admin Dashboard
								</MenuLinkItem>
							)}
							<MenuHeader>
								<p className="text-base font-black">{user?.name ?? "Profil"}</p>
								{user?.email && (
									<p className="mt-1 truncate text-sm font-semibold text-muted">
										{user.email}
									</p>
								)}
							</MenuHeader>
							<MenuLinkItem href="/me/account" onClick={closeMenus}>
								Mein Account
							</MenuLinkItem>
							<MenuButtonItem onClick={handleLogout}>Abmelden</MenuButtonItem>
						</>
					)}
					{isAnonymous && (
						<>
							<MenuLinkItem href="/login" onClick={closeMenus}>
								Einloggen
							</MenuLinkItem>
							<MenuLinkItem href="/register" onClick={closeMenus}>
								Registrieren
							</MenuLinkItem>
						</>
					)}
				</Menu>
			)}
		</header>
	);
}
