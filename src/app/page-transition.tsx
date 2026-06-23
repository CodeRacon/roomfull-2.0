"use client";

import { clsx } from "clsx";
import { usePathname, useRouter } from "next/navigation";
import {
	type CSSProperties,
	createContext,
	type ReactElement,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

export type PageTransitionOrigin = {
	top: number;
	right: number;
	bottom: number;
	left: number;
};

type PageTransitionPhase = "origin" | "covering" | "covered" | "revealing";

type SingleStripeTransitionState = {
	colorClassName: string;
	href: string;
	label: string;
	origin: PageTransitionOrigin;
	phase: PageTransitionPhase;
	variant: "single-stripe";
};

type StripeBoardTransitionState = {
	href: string;
	origin: PageTransitionOrigin;
	phase: PageTransitionPhase;
	variant: "stripe-board";
};

type PageTransitionState =
	| SingleStripeTransitionState
	| StripeBoardTransitionState;

type StartSingleStripePageTransitionOptions = {
	colorClassName: string;
	href: string;
	label: string;
	origin: PageTransitionOrigin | null;
	variant?: "single-stripe";
};

type StartStripeBoardPageTransitionOptions = {
	href: string;
	origin: PageTransitionOrigin | null;
	variant: "stripe-board";
};

type StartPageTransitionOptions =
	| StartSingleStripePageTransitionOptions
	| StartStripeBoardPageTransitionOptions;

type PageTransitionContextValue = {
	startPageTransition: (options: StartPageTransitionOptions) => void;
};

type PageTransitionProviderProps = {
	children: ReactNode;
};

const coverDurationMs = 520;
const revealDurationMs = 430;
const stripeBoardPanels = [
	"bg-unit-hot-desk",
	"bg-unit-booth",
	"bg-unit-team-room",
	"bg-unit-meeting-room",
] as const;
const fallbackOrigin: PageTransitionOrigin = {
	top: 0,
	right: 0,
	bottom: 0,
	left: 0,
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
	null,
);

function getClipPath(origin: PageTransitionOrigin): string {
	return `inset(${origin.top}px ${origin.right}px ${origin.bottom}px ${origin.left}px)`;
}

function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getCurrentHref(): string {
	return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function getPathnameFromHref(href: string): string {
	return new URL(href, window.location.origin).pathname;
}

export function getPageTransitionOrigin(
	element: HTMLElement,
): PageTransitionOrigin {
	const rect = element.getBoundingClientRect();

	return {
		top: rect.top,
		right: window.innerWidth - rect.right,
		bottom: window.innerHeight - rect.bottom,
		left: rect.left,
	};
}

export function PageTransitionProvider({
	children,
}: PageTransitionProviderProps): ReactElement {
	const router = useRouter();
	const pathname = usePathname();
	const [transition, setTransition] = useState<PageTransitionState | null>(
		null,
	);
	const coverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const frameRef = useRef<number | null>(null);

	const clearScheduledWork = useCallback((): void => {
		if (coverTimeoutRef.current) {
			clearTimeout(coverTimeoutRef.current);
			coverTimeoutRef.current = null;
		}

		if (revealTimeoutRef.current) {
			clearTimeout(revealTimeoutRef.current);
			revealTimeoutRef.current = null;
		}

		if (frameRef.current) {
			cancelAnimationFrame(frameRef.current);
			frameRef.current = null;
		}
	}, []);

	const startPageTransition = useCallback(
		(options: StartPageTransitionOptions): void => {
			if (options.href === getCurrentHref() || prefersReducedMotion()) {
				router.push(options.href);
				return;
			}

			clearScheduledWork();

			setTransition(
				options.variant === "stripe-board"
					? {
							href: options.href,
							origin: options.origin ?? fallbackOrigin,
							phase: "origin",
							variant: "stripe-board",
						}
					: {
							colorClassName: options.colorClassName,
							href: options.href,
							label: options.label,
							origin: options.origin ?? fallbackOrigin,
							phase: "origin",
							variant: "single-stripe",
						},
			);

			frameRef.current = requestAnimationFrame(() => {
				setTransition((currentTransition) =>
					currentTransition
						? { ...currentTransition, phase: "covering" }
						: currentTransition,
				);
			});

			coverTimeoutRef.current = setTimeout(() => {
				setTransition((currentTransition) =>
					currentTransition
						? { ...currentTransition, phase: "covered" }
						: currentTransition,
				);
				router.push(options.href);
			}, coverDurationMs);
		},
		[clearScheduledWork, router],
	);

	useEffect(() => {
		return clearScheduledWork;
	}, [clearScheduledWork]);

	const transitionHref = transition?.href ?? null;
	const transitionPhase = transition?.phase ?? null;
	const transitionTargetPathname = transitionHref
		? getPathnameFromHref(transitionHref)
		: null;

	useEffect(() => {
		if (transitionPhase !== "covered") {
			return;
		}

		if (pathname !== transitionTargetPathname) {
			return;
		}

		frameRef.current = requestAnimationFrame(() => {
			setTransition((currentTransition) =>
				currentTransition
					? { ...currentTransition, phase: "revealing" }
					: currentTransition,
			);
		});

		revealTimeoutRef.current = setTimeout(() => {
			setTransition(null);
		}, revealDurationMs);
	}, [pathname, transitionPhase, transitionTargetPathname]);

	const contextValue = useMemo<PageTransitionContextValue>(
		() => ({ startPageTransition }),
		[startPageTransition],
	);

	const overlayStyle = transition
		? ({
				clipPath:
					transition.phase === "origin"
						? getClipPath(transition.origin)
						: "inset(0px 0px 0px 0px)",
			} satisfies CSSProperties)
		: undefined;

	return (
		<PageTransitionContext.Provider value={contextValue}>
			{children}
			{transition && (
				<div
					aria-hidden="true"
					className={clsx(
						"pointer-events-none fixed inset-0 z-50 overflow-hidden transition-[clip-path,transform] duration-520 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:hidden",
						transition.variant === "single-stripe" && "grid place-items-center",
						transition.variant === "stripe-board" && "grid grid-cols-4",
						transition.phase === "revealing" &&
							"-translate-y-full duration-430 ease-in",
						transition.variant === "single-stripe" && transition.colorClassName,
					)}
					style={overlayStyle}
				>
					{transition.variant === "single-stripe" && (
						<span
							className={clsx(
								"max-w-[min(80vw,48rem)] text-center text-6xl font-black leading-none text-primary transition-opacity duration-200 sm:text-8xl",
								transition.phase === "revealing" && "opacity-0",
							)}
						>
							{transition.label}
						</span>
					)}

					{transition.variant === "stripe-board" &&
						stripeBoardPanels.map((panelClassName) => (
							<div
								key={panelClassName}
								className={clsx(
									"relative min-w-0 overflow-hidden",
									panelClassName,
								)}
							/>
						))}
				</div>
			)}
		</PageTransitionContext.Provider>
	);
}

export function usePageTransition(): PageTransitionContextValue {
	const context = useContext(PageTransitionContext);

	if (!context) {
		throw new Error(
			"usePageTransition must be used within PageTransitionProvider",
		);
	}

	return context;
}
