import type { Metadata } from "next";

// Styles
import "./globals.css";
import { Montserrat } from "next/font/google";
import { Toaster } from "sonner";

// Providers
import SidebarProvider from "./context/SidebarContext/SidebarProvider";

// Variables
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wentech",
  description: "Wentech - Your gateway to unique tours and rental experiences",
  keywords: ["tours", "rentals", "experiences", "travel", "booking"],
  authors: [{ name: "Wentech" }],
  creator: "Wentech",
  publisher: "Wentech",
  openGraph: {
    title: "Wentech",
    description:
      "Wentech - Your gateway to unique tours and rental experiences",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wentech",
    description:
      "Wentech - Your gateway to unique tours and rental experiences",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <html lang="en">
        <body className={`${montserrat.className} antialiased`}>
          {children}
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </SidebarProvider>
  );
}
