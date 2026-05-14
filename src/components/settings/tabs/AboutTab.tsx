"use client";

import { APP_NAME, APP_VERSION, APP_BUILD } from "@/data/app-meta";
import { CHANGELOG } from "@/data/changelog";
import { ContactSupportForm } from "../about/ContactSupportForm";

const MAX_VISIBLE_RELEASES = 5;

export function AboutTab() {
  const isDev = process.env.NODE_ENV === "development";
  const visibleReleases = CHANGELOG.slice(0, MAX_VISIBLE_RELEASES);
  const hasMore = CHANGELOG.length > MAX_VISIBLE_RELEASES;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Version */}
      <div className="card-redesign p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white font-rajdhani">
              {APP_NAME}
            </h2>
            <p className="text-3xl font-mono font-bold text-cyan-brand mt-1">
              v{APP_VERSION}
            </p>
            <p className="text-sm text-white/40 mt-1 font-mono">
              Build {APP_BUILD}
            </p>
          </div>
          {isDev && (
            <span className="text-xs uppercase tracking-wide bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2.5 py-1 rounded-full">
              Development
            </span>
          )}
        </div>
      </div>

      {/* Changelog */}
      <div className="card-redesign p-6">
        <h2 className="text-lg font-semibold text-white font-rajdhani mb-4">
          Šta je novo
        </h2>
        <div className="space-y-4">
          {visibleReleases.map((release) => (
            <div
              key={release.version}
              className="rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-base font-mono font-bold text-cyan-brand">
                  v{release.version}
                </span>
                <span className="text-sm text-white/40">— {release.date}</span>
              </div>
              <ul className="space-y-1">
                {release.changes.map((change, i) => (
                  <li
                    key={i}
                    className="text-sm text-white/70 flex gap-2 leading-relaxed"
                  >
                    <span
                      className="text-cyan-brand/50 flex-shrink-0"
                      aria-hidden="true"
                    >
                      •
                    </span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {hasMore && (
          <button
            type="button"
            className="mt-4 text-sm text-cyan-brand hover:text-cyan-bright transition-colors"
          >
            Vidi sve
          </button>
        )}
      </div>

      {/* Contact support */}
      <ContactSupportForm />
    </div>
  );
}
