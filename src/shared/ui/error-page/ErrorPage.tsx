import Link from "next/link";
import type { ReactElement } from "react";

type ErrorPageProps = {
	statusCode: number;
	title: string;
	description?: string;
	actionLabel?: string;
	actionHref?: string;
};

const stripeClassNames = [
	"bg-unit-hot-desk",
	"bg-unit-booth",
	"bg-unit-team-room",
	"bg-unit-meeting-room",
];

export function ErrorPage({
	statusCode,
	title,
	description,
	actionLabel = "Zur Startseite",
	actionHref = "/",
}: ErrorPageProps): ReactElement {
	return (
		<main className="error-page-shell grid min-h-svh bg-background text-primary md:grid-cols-[minmax(0,1fr)_clamp(5rem,16vw,18rem)]">
			<section className="flex min-h-[calc(100svh-7rem)] flex-col justify-between px-5 py-8 md:min-h-svh md:px-8 md:py-10">
				<p className="error-page-code mx-auto block origin-center text-center text-[clamp(8rem,37vw,34rem)] font-black leading-[0.78] tracking-[0]">
					{statusCode}
				</p>
				<div className="max-w-2xl">
					<h1 className="text-3xl font-semibold leading-tight tracking-[0] text-primary md:text-4xl">
						{title}
					</h1>
					{description ? (
						<p className="mt-4 max-w-xl text-base leading-relaxed text-muted md:text-lg">
							{description}
						</p>
					) : null}
					<Link
						href={actionHref}
						className="mt-8 inline-flex min-h-12 items-center justify-center border-2 border-primary bg-transparent px-7 py-3 text-base font-black text-primary transition-colors hover:bg-primary hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
					>
						{actionLabel}
					</Link>
				</div>
			</section>
			<aside aria-hidden="true" className="grid h-28 grid-cols-4 md:h-auto">
				{stripeClassNames.map((stripeClassName) => (
					<span key={stripeClassName} className={stripeClassName} />
				))}
			</aside>
		</main>
	);
}
