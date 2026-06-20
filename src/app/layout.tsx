import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./styles/globals.css";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
	title: "RoomFull 2.0",
	description: "Room booking MVP",
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
				<AppProviders>
					<Header />
					{children}
					<Footer />
				</AppProviders>
			</body>
		</html>
	);
}
