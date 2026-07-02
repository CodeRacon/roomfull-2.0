import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./styles/globals.css";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
	title: "RoomFull",
	description: "Room booking demo",
	icons: {
		icon: "/logo/roomfull-favicon.svg",
	},
};

type RootLayoutProps = Readonly<{
	children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="de">
			<body>
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}
