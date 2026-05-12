"use client";

import { useConnectionStore } from "@/lib/store/connection-store";
import { ConnectionHub } from "./ConnectionHub";
import { LiveFlightDashboard } from "./LiveFlightDashboard";
import { DeviceHealthCards } from "./DeviceHealthCards";

export function ScanningClient() {
  const connected = useConnectionStore((s) => s.status === "connected");

  return (
    <div className="relative h-[calc(100vh-72px)] overflow-hidden px-6 pt-6 pb-[88px]">
      {connected ? <LiveFlightDashboard /> : <ConnectionHub />}

      {connected && (
        <div className="absolute bottom-6 left-6 z-10">
          <DeviceHealthCards />
        </div>
      )}
    </div>
  );
}
