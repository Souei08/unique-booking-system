import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

import ToastAlert from "./_components/common/ToastAlert";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unique Tours And Rentals",
  description: "Find and book unique tours and rental experiences",
  keywords: ["tours", "rentals", "experiences", "travel", "booking"],
  authors: [{ name: "Unique Tours And Rentals" }],
  creator: "Unique Tours And Rentals",
  publisher: "Unique Tours And Rentals",
  openGraph: {
    title: "Unique Tours And Rentals",
    description: "Find and book unique tours and rental experiences",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unique Tours And Rentals",
    description: "Find and book unique tours and rental experiences",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} antialiased`}>
        {children}

        <ToastAlert />
      </body>
    </html>
  );
}
