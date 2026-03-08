import type { Metadata } from "next";
import { Epilogue } from "next/font/google";
import "./globals.css";

const epilogue = Epilogue({
  subsets: ["latin"],
  variable: "--font-sans",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "ClearPath Dx — Diagnostics Marketplace",
  description:
    "ClearPath Dx connects families with licensed diagnosticians for faster pediatric evaluations. Neutral marketplace, no waitlists.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${epilogue.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
