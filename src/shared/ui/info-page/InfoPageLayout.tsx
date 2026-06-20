import type { ReactNode } from "react";
import { InfoPageNav } from "./InfoPageNav";

const contentScrollContainerId = "info-page-content-scroll";

export type InfoPageSection = {
	id: string;
	navLabel: string;
	title: string;
	children: ReactNode;
};

type InfoPageLayoutProps = {
	title: string;
	subtitle: string;
	intro: string;
	sections: InfoPageSection[];
};

export function InfoPageLayout({
	title,
	subtitle,
	intro,
	sections,
}: InfoPageLayoutProps) {
	return (
		<main className="min-h-[calc(100svh-var(--app-shell-chrome-height))] bg-background px-4 py-8 text-text md:px-6 lg:h-[calc(100svh-var(--app-shell-chrome-height))] lg:overflow-hidden lg:py-10">
			<div className="mx-auto grid h-full w-full max-w-7xl gap-10 lg:grid-cols-[minmax(20rem,0.42fr)_minmax(0,0.58fr)] lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-x-14 lg:gap-y-8">
				<header className="lg:col-start-1 lg:row-start-1">
					<p className="type-header-link mb-3 text-accent">{subtitle}</p>
					<h1 className="type-display-page max-w-3xl">{title}</h1>
					<p className="type-body-lead mt-5 max-w-3xl text-text">{intro}</p>
				</header>

				<div className="min-h-0 lg:col-start-1 lg:row-start-2">
					<InfoPageNav
						title={title}
						contentScrollContainerId={contentScrollContainerId}
						items={sections.map((section) => ({
							id: section.id,
							navLabel: section.navLabel,
						}))}
					/>
				</div>

				<div
					id={contentScrollContainerId}
					className="info-page-scroll-area lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:grid lg:h-full lg:grid-rows-[subgrid] lg:overflow-y-auto lg:pr-4"
				>
					<div className="space-y-14 md:space-y-18 lg:row-start-2 lg:pb-12">
						{sections.map((section, index) => (
							<section key={section.id} id={section.id} className="scroll-mt-8">
								<h2 className="type-panel-title max-w-4xl">
									({index}) {section.title}
								</h2>
								<div className="mt-6 space-y-5 text-lg leading-8 text-text md:text-xl md:leading-9 [&_a]:font-black [&_a]:underline [&_a]:decoration-2 [&_a]:underline-offset-4 [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
									{section.children}
								</div>
							</section>
						))}
					</div>
				</div>
			</div>
		</main>
	);
}
