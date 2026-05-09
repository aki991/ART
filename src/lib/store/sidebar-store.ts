import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarStore {
  expanded: boolean;
  toggle: () => void;
  setExpanded: (expanded: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      expanded: true,
      toggle: () => set((s) => ({ expanded: !s.expanded })),
      setExpanded: (expanded) => set({ expanded }),
    }),
    { name: "art-sidebar" }
  )
);
