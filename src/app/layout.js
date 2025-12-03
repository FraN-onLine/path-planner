import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ilocos Norte Tourism Path Planner",
  description: "Ilocos Norte Tourism Path Planner is the intelligent software your family & friends will love for their next adventure.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased relative min-h-dvh overflow-x-hidden`}>
        {/* Decorative background */}
        <div aria-hidden className="pointer-events-none fixed inset-0 bg-app-gradient" />
        {/* Subtle top gradient for depth */}
        <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 h-40 bg-gradient-to-b from-background/0 via-background/40 to-background/0" />
        <div className="relative">
          {children}
        </div>
      </body>
    </html>
  );
}
