"use client";

import { useConnectionStore } from "@/lib/store/connection-store";
import { DeviceImage } from "./DeviceImage";
import { ConnectionMethodCard } from "./ConnectionMethodCard";
import { LiveFlightDashboard } from "./LiveFlightDashboard";

export function ConnectionHub() {
  const status = useConnectionStore((s) => s.status);

  if (status === "connected") {
    return <LiveFlightDashboard />;
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center gap-12">
      <DeviceImage />

      <div className="flex gap-10 justify-center">
        <ConnectionMethodCard method="usb-c" title="USB-C" />
        <ConnectionMethodCard method="bluetooth" title="Bluetooth" />
      </div>
    </div>
  );
}
