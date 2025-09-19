import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Induengicons - Engineering Software & Civil Solutions",
  description: "Multi-disciplinary engineering firm specializing in custom software development, web applications, cloud solutions, and civil infrastructure projects. Professional engineering services with quality delivery.",
  keywords: "engineering, software development, civil engineering, web development, cloud solutions, infrastructure, Next.js, construction",
  authors: [{ name: "Induengicons" }],
  creator: "Induengicons",
  publisher: "Induengicons",
  robots: "index, follow",
  openGraph: {
    title: "Induengicons - Engineering Software & Civil Solutions",
    description: "Professional engineering services combining software development and civil infrastructure expertise",
    type: "website",
    locale: "en_US",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
