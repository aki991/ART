import type { Metadata } from "next";
import AuthApp from "./_components/AuthApp";

export const metadata: Metadata = {
  title: "Prijava — Aero Ring Tech",
};

export default function LoginPage() {
  return <AuthApp />;
}
