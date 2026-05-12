import BoothIcon from "@public/icons/booking-options/booth.svg";
import HotDeskIcon from "@public/icons/booking-options/hot-desk.svg";
import MeetingRoomIcon from "@public/icons/booking-options/meeting-room.svg";
import TeamRoomIcon from "@public/icons/booking-options/team-room.svg";
import ChevronRightIcon from "@public/icons/general/ic-chevron-right.svg";
import "./BookingOptionsList.css";
import {
	type BookingOption,
	formatBookingOptionStatus,
	getBookingOptionDescription,
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

export function BookingOptionsList({
	bookingOptions,
}: BookingOptionsListProps) {
	if (bookingOptions.length === 0) {
		return (
			<FeedbackBox className="mt-8 rounded-md border border-dashed border-border bg-surface px-4 py-6 text-sm text-muted">
				Keine Buchungsoptionen verfügbar.
			</FeedbackBox>
		);
	}

	return (
		<section className="mt-8 grid gap-4 sm:grid-cols-2">
			{bookingOptions.map((option) => {
				const BookingOptionIcon = getBookingOptionIcon(option.key);

				return (
					<Panel
						padding="compact"
						key={option.key}
						className={`room-card ${getBookingOptionCardClassName(option.key)} p-5`}
					>
						<div className="flex min-h-32 items-center gap-5">
							<div className="room-card__icon flex size-20 shrink-0 items-center justify-center rounded-md text-lg font-bold">
								<BookingOptionIcon
									className="room-card__icon-svg"
									aria-hidden="true"
								/>
							</div>

							<div className="min-w-0 flex-1">
								<h1 className="room-card__title text-lg font-bold">
									{formatUnitTypeName(option.key)}
								</h1>

								<p className="room-card__text mt-2 text-sm leading-6">
									{getBookingOptionDescription(option.key)}
								</p>

								<div className="mt-4 flex flex-wrap gap-2">
									<Badge className="room-card__badge text-sm">
										Aktiv: {option.totalActiveUnits}
									</Badge>
									<Badge className="room-card__badge text-sm">
										Status: {formatBookingOptionStatus(option.status)}
									</Badge>
								</div>
							</div>

							<span
								className="room-card__arrow flex size-10 shrink-0 items-center justify-center rounded-full text-3xl leading-none shadow-xs"
								aria-hidden="true"
							>
								<ChevronRightIcon className="room-card__arrow-svg" />
							</span>
						</div>
					</Panel>
				);
			})}
		</section>
	);
}
