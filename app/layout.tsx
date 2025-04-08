import type { Metadata } from "next";

// Styles
import "./globals.css";
import { Montserrat } from "next/font/google";

// Components
import ToastAlert from "./_components/common/ToastAlert";

// Providers
import AuthProvider from "./context/AuthContext/AuthProvider";
import SidebarProvider from "./context/SidebarContext/SidebarProvider";
import { ModalProvider } from "./context/ModalContext/ModalProvider";
import { DrawerProvider } from "./context/DrawerContext/DrawerProvider";

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
    // <AuthProvider>
    <SidebarProvider>
      <ModalProvider>
        <DrawerProvider>
          <html lang="en">
            <body className={`${montserrat.className} antialiased`}>
              {children}
              <ToastAlert />
            </body>
          </html>
        </DrawerProvider>
      </ModalProvider>
    </SidebarProvider>
    // </AuthProvider>
  );
}
