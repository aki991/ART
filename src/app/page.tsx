import type { Metadata } from "next";
import AuthApp from "@/components/auth/AuthApp";

export const metadata: Metadata = {
  title: "Prijava — Aero Ring Tech",
};

export default function Home() {
  return <AuthApp />;
}
