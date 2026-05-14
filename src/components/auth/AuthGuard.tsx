"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

// Wraps the authenticated app shell. Unauthenticated visitors are bounced to
// the login page (/). The `mounted` gate keeps the server render and the first
// client render identical (both null) so persisted auth state can hydrate
// without a hydration mismatch.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace("/");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) return null;

  return <>{children}</>;
}
