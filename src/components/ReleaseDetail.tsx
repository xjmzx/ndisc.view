import { CoverArt } from "./CoverArt";
import { hostnameOf, type Release } from "../lib/nostr";

interface Props {
  release: Release;
  onBack: () => void;
}

// Detail fields shown when present, in display order.
const FIELDS = [
  ["year", "year"],
  ["medium", "medium"],
  ["format", "format"],
  ["label", "label"],
  ["catalog", "catalog"],
  ["country", "country"],
  ["condition", "condition"],
  ["type", "type"],
  ["category", "category"],
] as const;

export function ReleaseDetail({ release, onBack }: Props) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <header
        className="sticky top-0 z-10 bg-bg/95 backdrop-blur border-b
                   border-surface px-4 pt-[env(safe-area-inset-top)]"
      >
        <button
          type="button"
          onClick={onBack}
          className="py-3 text-sm text-accent"
        >
          ‹ back
        </button>
      </header>

      <main className="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <CoverArt
          src={release.image}
          alt={release.title}
          className="w-full aspect-square rounded-xl mb-4"
        />

        <h2 className="text-lg font-bold leading-tight">{release.artist}</h2>
        <p className="text-base text-fg/75 mb-4">{release.title}</p>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          {FIELDS.map(([key, label]) => {
            const value = release[key];
            if (!value) return null;
            return (
              <div key={label} className="contents">
                <dt className="text-muted">{label}</dt>
                <dd className="text-fg/90 break-words">{value}</dd>
              </div>
            );
          })}
        </dl>

        {release.notes && (
          <p className="mt-4 text-sm text-fg/80 whitespace-pre-wrap">
            {release.notes}
          </p>
        )}

        {release.source && (
          <a
            href={release.source}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-sm text-accent underline
                       break-all"
          >
            {hostnameOf(release.source) ?? release.source}
          </a>
        )}
      </main>
    </div>
  );
}
