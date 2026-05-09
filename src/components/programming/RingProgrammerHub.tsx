"use client";

import { ProgrammerSlot } from "./ProgrammerSlot";
import { PigeonForm } from "./PigeonForm";
import { DetectedRingTable } from "./DetectedRingTable";
import { SessionProgramsTable } from "./SessionProgramsTable";

export function RingProgrammerHub() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
      <aside className="space-y-6">
        <ProgrammerSlot />
        <PigeonForm />
      </aside>
      <main className="space-y-6">
        <DetectedRingTable />
        <SessionProgramsTable />
      </main>
    </div>
  );
}
