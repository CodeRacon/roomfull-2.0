import type { Metadata } from "next";
import {
	type Dictionary,
	defaultLocale,
	getDictionary,
	isLocale,
	type Locale,
} from "@/shared/i18n";
import type { InfoPageSection } from "@/shared/ui";
import { InfoPageLayout } from "@/shared/ui";

type FaqPageProps = {
	params: Promise<{ lang: string }>;
};

function resolveLocale(lang: string): Locale {
	return isLocale(lang) ? lang : defaultLocale;
}

function createFaqSections(copy: Dictionary["faqPage"]): InfoPageSection[] {
	const sections = copy.sections;

	return [
		{
			id: "matching-space",
			navLabel: sections.matchingSpace.question,
			title: sections.matchingSpace.question,
			children: (
				<>
					<p>{sections.matchingSpace.intro}</p>
					<ul>
						<li>{sections.matchingSpace.hotDesk}</li>
						<li>{sections.matchingSpace.booth}</li>
						<li>{sections.matchingSpace.teamRoom}</li>
						<li>{sections.matchingSpace.meetingRoom}</li>
					</ul>
				</>
			),
		},
		{
			id: "areas",
			navLabel: sections.areas.question,
			title: sections.areas.question,
			children: (
				<>
					<p>{sections.areas.openWorld}</p>
					<p>{sections.areas.quietPlace}</p>
				</>
			),
		},
		{
			id: "basic-equipment",
			navLabel: sections.basicEquipment.question,
			title: sections.basicEquipment.question,
			children: (
				<>
					<p>{sections.basicEquipment.answer}</p>
					<p>{sections.basicEquipment.trafficLight}</p>
				</>
			),
		},
		{
			id: "equipment",
			navLabel: sections.equipment.question,
			title: sections.equipment.question,
			children: (
				<ul>
					<li>{sections.equipment.hotDesk}</li>
					<li>{sections.equipment.booth}</li>
					<li>{sections.equipment.teamRoom}</li>
					<li>{sections.equipment.meetingRoom}</li>
				</ul>
			),
		},
		{
			id: "booking",
			navLabel: sections.booking.question,
			title: sections.booking.question,
			children: (
				<>
					<p>{sections.booking.intro}</p>
					<p>{sections.booking.selection}</p>
					<p>{sections.booking.account}</p>
				</>
			),
		},
		{
			id: "duration",
			navLabel: sections.duration.question,
			title: sections.duration.question,
			children: (
				<>
					<p>{sections.duration.intro}</p>
					<ul>
						<li>{sections.duration.hotDesk}</li>
						<li>{sections.duration.booth}</li>
						<li>{sections.duration.teamRoom}</li>
						<li>{sections.duration.meetingRoom}</li>
					</ul>
				</>
			),
		},
		{
			id: "opening-hours",
			navLabel: sections.openingHours.question,
			title: sections.openingHours.question,
			children: <p>{sections.openingHours.answer}</p>,
		},
		{
			id: "cancellation",
			navLabel: sections.cancellation.question,
			title: sections.cancellation.question,
			children: <p>{sections.cancellation.answer}</p>,
		},
		{
			id: "overtime",
			navLabel: sections.overtime.question,
			title: sections.overtime.question,
			children: (
				<>
					<p>{sections.overtime.intro}</p>
					<ul>
						<li>{sections.overtime.green}</li>
						<li>{sections.overtime.yellow}</li>
						<li>{sections.overtime.red}</li>
					</ul>
					<p>{sections.overtime.outro}</p>
				</>
			),
		},
	];
}

export async function generateMetadata({
	params,
}: FaqPageProps): Promise<Metadata> {
	const locale = resolveLocale((await params).lang);
	const dictionary = await getDictionary(locale);

	return dictionary.faqPage.metadata;
}

export default async function FaqPage({ params }: FaqPageProps) {
	const locale = resolveLocale((await params).lang);
	const copy = (await getDictionary(locale)).faqPage;

	return (
		<InfoPageLayout
			title={copy.title}
			subtitle={copy.subtitle}
			intro={copy.intro}
			sections={createFaqSections(copy)}
		/>
	);
}
