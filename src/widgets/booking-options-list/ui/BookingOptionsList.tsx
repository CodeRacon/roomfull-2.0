import BoothIcon from "@public/icons/booking-options/booth.svg";
import HotDeskIcon from "@public/icons/booking-options/hot-desk.svg";
import MeetingRoomIcon from "@public/icons/booking-options/meeting-room.svg";
import TeamRoomIcon from "@public/icons/booking-options/team-room.svg";
import ChevronRightIcon from "@public/icons/general/ic-chevron-right.svg";
import Link from "next/link";
import "./BookingOptionsList.css";
import {
	type BookingOption,
	getBookingOptionDescription,
	getBookingOptionHref,
} from "@/entities/booking-option";
import { formatUnitTypeName } from "@/entities/unit";
import { Badge, FeedbackBox, Panel } from "@/shared/ui";

type BookingOptionsListProps = {
	bookingOptions: BookingOption[];
};

function getBookingOptionCardClassName(key: BookingOption["key"]) {
	switch (key) {
		case "HOT_DESK":
			return "room-card--desk";
		case "BOOTH":
			return "room-card--booth";
		case "TEAM_ROOM":
			return "room-card--team";
		case "MEETING_ROOM":
			return "room-card--meeting";
	}
}

function getBookingOptionIcon(key: BookingOption["key"]) {
	switch (key) {
		case "HOT_DESK":
			return HotDeskIcon;
		case "BOOTH":
			return BoothIcon;
		case "TEAM_ROOM":
			return TeamRoomIcon;
		case "MEETING_ROOM":
			return MeetingRoomIcon;
	}
}

function getBookingOptionCtaLabel(key: BookingOption["key"]) {
	switch (key) {
		case "HOT_DESK":
			return "Platz auswählen";
		case "BOOTH":
			return "Booth auswählen";
		case "TEAM_ROOM":
			return "Team Room auswählen";
		case "MEETING_ROOM":
			return "Meeting Room auswählen";
	}
}

export function BookingOptionsList({
	bookingOptions,
}: BookingOptionsListProps) {
	if (bookingOptions.length === 0) {
		return (
			<FeedbackBox variant="empty" className="mt-8">
				Gerade sind keine Plätze oder Räume verfügbar.
			</FeedbackBox>
		);
	}

	return (
		<section className="mt-8 grid gap-4 sm:grid-cols-2">
			{bookingOptions.map((option) => {
				const BookingOptionIcon = getBookingOptionIcon(option.key);
				const href = getBookingOptionHref(option.key);

				return (
					<Link key={option.key} href={href} className="block rounded-md">
						<Panel
							padding="compact"
							className={`room-card room-card--interactive ${getBookingOptionCardClassName(option.key)}`}
						>
							<div className="flex min-h-32 items-center gap-5">
								<div className="room-card__icon flex size-28 shrink-0 items-center justify-center rounded-md text-lg font-bold">
									<BookingOptionIcon
										className="room-card__icon-svg"
										aria-hidden="true"
									/>
								</div>

								<div className="min-w-0 flex-1">
									<div className="flex justify-between items-center w-full!">
										<h2 className="room-card__title text-lg font-bold">
											{formatUnitTypeName(option.key)}
										</h2>
										<Badge className="room-card__badge text-sm">
											{option.key === "HOT_DESK"
												? "Einzelplatz"
												: `bis zu ${option.maxCapacity} Personen`}
										</Badge>
									</div>

									<p className="room-card__text mt-2 text-sm leading-6">
										{getBookingOptionDescription(option.key)}
									</p>

									<span className="room-card__arrow mt-4 flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium shadow-xs">
										{getBookingOptionCtaLabel(option.key)}
										<ChevronRightIcon
											className="room-card__arrow-svg"
											aria-hidden="true"
										/>
									</span>
								</div>
							</div>
						</Panel>
					</Link>
				);
			})}
		</section>
	);
}
