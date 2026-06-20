"use client";

import { clsx } from "clsx";
import type { MouseEvent } from "react";
import { useState } from "react";

export type InfoPageNavItem = {
	id: string;
	navLabel: string;
};

type InfoPageNavProps = {
	title: string;
	items: InfoPageNavItem[];
	contentScrollContainerId: string;
};

export function InfoPageNav({
	title,
	items,
	contentScrollContainerId,
}: InfoPageNavProps) {
	const [activeSectionId, setActiveSectionId] = useState<string | undefined>(
		items[0]?.id,
	);

	function handleNavClick(
		event: MouseEvent<HTMLAnchorElement>,
		sectionId: string,
	) {
		setActiveSectionId(sectionId);

		if (!window.matchMedia("(min-width: 1024px)").matches) {
			return;
		}

		const scrollContainer = document.getElementById(contentScrollContainerId);
		const targetSection = document.getElementById(sectionId);

		if (!scrollContainer || !targetSection) {
			return;
		}

		event.preventDefault();

		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const navTop = event.currentTarget
			.closest("nav")
			?.getBoundingClientRect().top;
		const targetSectionTop = targetSection.getBoundingClientRect().top;
		const targetScrollTop =
			scrollContainer.scrollTop + targetSectionTop - (navTop ?? 0);

		scrollContainer.scrollTo({
			top: targetScrollTop,
			behavior: prefersReducedMotion ? "auto" : "smooth",
		});
		window.history.replaceState(null, "", `#${sectionId}`);
	}

	return (
		<nav aria-label={`${title} Bereiche`} className="min-h-0">
			<ol className="border-2 border-primary">
				{items.map((item, index) => {
					const isActive = item.id === activeSectionId;

					return (
						<li
							key={item.id}
							className={index > 0 ? "border-primary border-t-2" : undefined}
						>
							<a
								href={`#${item.id}`}
								aria-current={isActive ? "location" : undefined}
								onClick={(event) => handleNavClick(event, item.id)}
								className={clsx(
									"group grid grid-cols-[3.5rem_minmax(0,1fr)_1.25rem] items-center gap-3 px-4 py-5 font-black text-lg leading-tight transition-colors hover:bg-primary hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus md:px-5 lg:grid-cols-[3rem_minmax(0,1fr)_1.25rem] lg:py-3 lg:text-base",
									isActive
										? "bg-primary text-on-primary"
										: "bg-background text-primary",
								)}
							>
								<span aria-hidden="true">({index})</span>
								<span className="min-w-0 text-pretty">{item.navLabel}</span>
								<span
									aria-hidden="true"
									className={clsx(
										"size-0 border-y-[0.55rem] border-y-transparent border-l-[0.7rem] transition-colors",
										isActive
											? "border-l-on-primary"
											: "border-l-primary group-hover:border-l-on-primary",
									)}
								/>
							</a>
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
