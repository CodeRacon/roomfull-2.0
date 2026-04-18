import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "RoomFull 2.0",
  description: "Room booking MVP",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
