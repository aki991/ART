import { redirect } from "next/navigation";
import { Sidebar } from "@/components/app-shell/Sidebar";
import { TopBar } from "@/components/app-shell/TopBar";
import { MobileShell } from "@/components/app-shell/MobileShell";
import { MobileBottomTabBar } from "@/components/app-shell/MobileBottomTabBar";
import { CurrentUserProvider } from "@/components/providers/CurrentUserProvider";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, first_name, last_name, phone, avatar_url, is_super_admin")
    .eq("id", user.id)
    .single();

  return (
    <CurrentUserProvider
      user={{
        id: user.id,
        email: user.email ?? "",
        isSuperAdmin: profile?.is_super_admin === true,
        profile: profile
          ? {
              username: profile.username,
              firstName: profile.first_name,
              lastName: profile.last_name,
              phone: profile.phone ?? "",
              avatarUrl: profile.avatar_url ?? null,
            }
          : null,
      }}
    >
      <div className="flex h-screen overflow-hidden bg-bg-app">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-bg-app">
          <MobileShell />
          <TopBar />
          <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">{children}</main>
          <MobileBottomTabBar />
        </div>
      </div>
    </CurrentUserProvider>
  );
}
