import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aurelia — Your money, in golden balance",
  description:
    "Aurelia is a thoughtfully designed digital wallet for everyday money.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
