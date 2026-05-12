"use client";

import { ProgrammerSlot } from "./ProgrammerSlot";
import { PigeonForm } from "./PigeonForm";
import { DetectedRingTable } from "./DetectedRingTable";
import { SessionProgramsTable } from "./SessionProgramsTable";

export function RingProgrammerHub() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <aside className="space-y-6">
        <ProgrammerSlot />
        <PigeonForm />
      </aside>
      <main className="lg:col-span-2 space-y-6">
        <DetectedRingTable />
        <SessionProgramsTable />
      </main>
    </div>
  );
}
