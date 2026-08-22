import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
