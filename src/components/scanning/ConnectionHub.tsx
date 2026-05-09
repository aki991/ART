"use client";

import { useConnectionStore } from "@/lib/store/connection-store";
import { DeviceImage } from "./DeviceImage";
import { ConnectionStatusBadge } from "./ConnectionStatusBadge";
import { ConnectionMethodCard } from "./ConnectionMethodCard";
import { LiveFlightDashboard } from "./LiveFlightDashboard";

export function ConnectionHub() {
  const status = useConnectionStore((s) => s.status);

  if (status === "connected") {
    return <LiveFlightDashboard />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <DeviceImage />

      <div className="flex justify-center">
        <ConnectionStatusBadge />
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-semibold font-rajdhani text-gray-900">
          Povezivanje baznog uredjaja
        </h2>
        <p className="text-base text-gray-600 mt-2">
          Izaberite metod komunikacije sa prijemnikom
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConnectionMethodCard
          method="usb-c"
          title="USB-C"
          description="Brza i pouzdana veza preko USB-C kabla"
          accentColor="cyan"
        />
        <ConnectionMethodCard
          method="bluetooth"
          title="Bluetooth"
          description="Bežično povezivanje, do 10 metara"
          accentColor="blue"
        />
      </div>

      <p className="text-center text-xs text-gray-500 mt-8">
        Bazni uredjaj se prepoznaje automatski po izboru metode
      </p>
    </div>
  );
}
