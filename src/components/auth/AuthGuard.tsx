// Authentication is enforced by middleware (redirect to /) and by the
// (app)/layout.tsx Server Component (server-side getUser check). This component
// is kept as a no-op shim so existing call sites don't need to be touched.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
