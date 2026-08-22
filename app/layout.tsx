import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PrepArsenal — AI-Powered Govt Exam Prep Platform",
  description: "Crack SSC CGL, RBI Grade B, NABARD, SEBI Grade A, RRB NTPC, UPSC APFC, LIC AAO & more with AI-powered trend analysis, smart practice, and personalized study plans. Built by aspirants, for aspirants.",
  keywords: "SSC CGL, RBI Grade B, NABARD Grade A, SEBI Grade A, RRB NTPC, UPSC APFC, LIC AAO, government exam preparation, previous year questions, exam trends, AI tutor",
  authors: [{ name: "PrepArsenal" }],
  openGraph: {
    title: "PrepArsenal — Crack Govt Exams with AI",
    description: "Analyze exam trends, practice with PYQs, get AI-powered doubt solving — all in one platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}

