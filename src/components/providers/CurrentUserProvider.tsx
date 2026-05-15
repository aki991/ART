"use client";

import { createContext, useContext } from "react";

export interface CurrentUserProfile {
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl: string | null;
}

export interface CurrentUser {
  id: string;
  email: string;
  profile: CurrentUserProfile | null;
}

const CurrentUserContext = createContext<CurrentUser | null>(null);

export function CurrentUserProvider({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser(): CurrentUser {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used inside <CurrentUserProvider>");
  }
  return ctx;
}
