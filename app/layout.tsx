import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tipovačka EURO 2028",
  description: "Fotbalová tipovačka na EURO 2028",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className={geist.className}>
      <body className="min-h-screen bg-gray-950 text-white">
        {children}
      </body>
    </html>
  );
}
