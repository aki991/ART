import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geist = Geist({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Aero Ring Tech",
  description: "Upravljanje elektronskim prstenovima golubova",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sr"
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <body className="font-sans">
        {children}
        <Toaster position="bottom-right" richColors closeButton duration={4000} />
      </body>
    </html>
  );
}
