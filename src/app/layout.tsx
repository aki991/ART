import type { Metadata } from "next";
import { Orbitron, Rajdhani, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const orbitron = Orbitron({
  weight: ["600"],
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const rajdhani = Rajdhani({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
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
      className={`${orbitron.variable} ${rajdhani.variable} ${jetbrainsMono.variable}`}
    >
      <body style={{ fontFamily: "var(--font-rajdhani), sans-serif" }}>
        {children}
        <Toaster position="bottom-right" richColors closeButton duration={4000} />
      </body>
    </html>
  );
}
