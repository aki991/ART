import Link from "next/link";
import { Radio } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { RecentScan } from "@/lib/mock/dashboard-data";

interface RecentScansTableProps {
  scans: RecentScan[];
}

function rssiBadge(rssi: number): string {
  if (rssi > -70) return "bg-green-100 text-green-800";
  if (rssi >= -85) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

export function RecentScansTable({ scans }: RecentScansTableProps) {
  return (
    <div className="card-redesign">
      <div className="px-6 py-4 border-b border-cyan-brand/10 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold font-rajdhani text-gray-900">
          <Radio size={18} aria-hidden="true" />
          Poslednji skenovi
        </h2>
        <Link
          href="/scanning"
          className="text-sm text-cyan-brand font-medium hover:text-cyan-dark transition-colors"
        >
          Vidi sve →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header-gradient">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vreme</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ring ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Golub</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Antena</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RSSI</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((scan) => (
              <tr key={scan.id} className="table-row-alt table-row-hover border-t border-gray-100">
                <td className="px-6 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                  {formatRelativeTime(scan.scannedAt)}
                </td>
                <td className="px-6 py-3">
                  <span className="bg-cyan-brand/10 text-cyan-brand rounded px-2 py-0.5 font-mono font-semibold text-sm">
                    {scan.ringId}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-700">{scan.pigeonName ?? "—"}</td>
                <td className="px-6 py-3 text-gray-700">{scan.antennaId}</td>
                <td className="px-6 py-3">
                  <span className={cn("rounded px-2 py-0.5 text-xs font-semibold", rssiBadge(scan.rssi))}>
                    {scan.rssi} dBm
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
