import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pose",
  description:
    "Create, go live, earn, and grow on Pose — the African creator platform for videos, music, and live streaming.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.hugeicons.com/font/hgi-stroke-rounded.css"
        />
      </head>
      <body className="font-body">{children}</body>
    </html>
  );
}
