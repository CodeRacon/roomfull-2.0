"use client";

import { clsx } from "clsx";
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

	return (
		<header
			ref={headerRef}
			className="relative flex w-full items-center justify-center bg-primary px-4 py-4 md:px-6"
		>
			<nav className="flex w-full max-w-5xl items-center justify-between gap-6">
				<Link
					href="/"
					className={clsx(
						focusClass,
						"shrink-0 text-3xl font-bold text-primary-soft text-shadow-sm md:text-4xl",
					)}
				>
					RoomFull
				</Link>
				{!isAdmin && (
					<div className="hidden items-center gap-6 md:flex">
						<Link
							href="/booking-options"
							className={clsx(
								focusClass,
								"text-lg font-semibold text-primary-soft text-shadow-sm",
							)}
						>
							Buchen
						</Link>
					</div>
				)}
				<div className="hidden items-center justify-center gap-4 font-semibold text-primary-soft text-shadow-sm md:flex">
					{isAuthenticated && (
						<>
							{isCustomer && (
								<Link
									href="/me/bookings"
									onClick={closeMenus}
									className={clsx(
										focusClass,
										"text-lg font-semibold text-primary-soft text-shadow-sm",
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
										"text-lg font-semibold text-primary-soft text-shadow-sm",
									)}
								>
									Admin
								</Link>
							)}
							<div className="relative">
								<Button
									variant="secondary"
									className="border-surface!"
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
											<p className="text-sm font-semibold">
												{user?.name ?? "Profil"}
											</p>
											{user?.email && (
												<p className="mt-1 truncate text-xs text-muted">
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
									"text-lg font-semibold text-primary-soft text-shadow-sm",
								)}
							>
								Einloggen
							</Link>
							<Link
								href="/register"
								className={clsx(
									focusClass,
									"text-lg font-semibold text-primary-soft text-shadow-sm",
								)}
							>
								Registrieren
							</Link>
						</>
					)}
				</div>
				<Button
					variant="secondary"
					className="border-surface! md:hidden"
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
							<MenuHeader className="mt-2">
								<p className="text-sm font-semibold">
									{user?.name ?? "Profil"}
								</p>
								{user?.email && (
									<p className="mt-1 truncate text-xs text-muted">
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
