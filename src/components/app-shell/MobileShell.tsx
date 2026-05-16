"use client";

import { useState } from "react";
import { MobileTopBar } from "./MobileTopBar";
import { MobileHamburgerDrawer } from "./MobileHamburgerDrawer";

export function MobileShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <MobileTopBar onMenuClick={() => setDrawerOpen(true)} />
      <MobileHamburgerDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
