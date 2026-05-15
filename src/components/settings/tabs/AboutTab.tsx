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
            <h2 className="text-lg font-semibold text-text-primary font-rajdhani">
              {APP_NAME}
            </h2>
            <p className="text-3xl font-mono font-bold text-accent mt-1">
              v{APP_VERSION}
            </p>
            <p className="text-sm text-text-disabled mt-1 font-mono">
              Build {APP_BUILD}
            </p>
          </div>
          {isDev && (
            <span className="text-xs uppercase tracking-wide bg-bg-warning-light text-status-warning border border-status-warning/30 px-2.5 py-1 rounded-full">
              Development
            </span>
          )}
        </div>
      </div>

      {/* Changelog */}
      <div className="card-redesign p-6">
        <h2 className="text-lg font-semibold text-text-primary font-rajdhani mb-4">
          Šta je novo
        </h2>
        <div className="space-y-4">
          {visibleReleases.map((release) => (
            <div
              key={release.version}
              className="rounded-lg border border-border bg-bg-hover p-4"
            >
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-base font-mono font-bold text-accent">
                  v{release.version}
                </span>
                <span className="text-sm text-text-disabled">— {release.date}</span>
              </div>
              <ul className="space-y-1">
                {release.changes.map((change, i) => (
                  <li
                    key={i}
                    className="text-sm text-text-tertiary flex gap-2 leading-relaxed"
                  >
                    <span
                      className="text-accent/50 flex-shrink-0"
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
            className="mt-4 text-sm text-accent hover:text-cyan-bright transition-colors"
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
