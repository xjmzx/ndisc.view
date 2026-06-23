import { useMemo } from "react";
import { CoverArt } from "./CoverArt";
import { hostnameOf, type Release } from "../lib/nostr";
import type { FeedNote } from "../hooks/useFeed";

interface Props {
  notes: FeedNote[];
  loading: boolean;
  releases: Release[];
  onSelect: (release: Release) => void;
}

// A feed note's `a` reference is `31237:<ownerhex>:<release-d>`; pull the d.
function releaseDOf(a: string | undefined): string | undefined {
  if (!a) return undefined;
  const parts = a.split(":");
  return parts.length >= 3 ? parts.slice(2).join(":") : undefined;
}

// Curated feed — kind:31238 notes (owner + approved contributors). Each note is
// the author's own words/photos; the referenced release's artist/title/cover is
// hydrated from the 31237 we already loaded, never copied into the note.
export function FeedView({ notes, loading, releases, onSelect }: Props) {
  const byD = useMemo(() => {
    const m = new Map<string, Release>();
    for (const r of releases) m.set(r.d, r);
    return m;
  }, [releases]);

  return (
    <main className="flex-1 px-4 py-3">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-sm text-fg">
          curated <span className="text-muted">/ feed</span>
        </h2>
        {notes.length > 0 && (
          <span className="font-mono text-[11px] text-muted tabular-nums">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </span>
        )}
      </div>

      {loading && notes.length === 0 ? (
        <p className="text-muted text-sm py-12 text-center">loading…</p>
      ) : notes.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-fg/70">Nothing here yet</p>
          <p className="text-xs text-muted max-w-xs leading-relaxed">
            Curated picks &amp; new releases will appear here as they're posted.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((n) => {
            const rel = byD.get(releaseDOf(n.release) ?? "");
            return (
              <li
                key={n.address}
                className="rounded-lg bg-surface p-3 flex flex-col gap-2"
              >
                {rel && (
                  <button
                    type="button"
                    onClick={() => onSelect(rel)}
                    className="flex items-center gap-3 text-left active:opacity-70 transition-opacity"
                  >
                    <CoverArt
                      src={rel.image}
                      alt={rel.title}
                      className="shrink-0 w-12 h-12 rounded-md"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium truncate">
                        {rel.artist}
                      </span>
                      <span className="block text-sm text-fg/70 truncate">
                        {rel.title}
                      </span>
                    </span>
                  </button>
                )}

                {n.title && <p className="text-sm font-semibold">{n.title}</p>}

                {n.images[0] && (
                  <img
                    src={n.images[0]}
                    alt=""
                    loading="lazy"
                    className="w-full rounded-md max-h-72 object-cover"
                  />
                )}

                {n.body && (
                  <p className="text-sm text-fg/80 whitespace-pre-wrap">
                    {n.body}
                  </p>
                )}

                {(n.topics.length > 0 || n.links.length > 0) && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    {n.topics.map((t) => (
                      <span key={t} className="text-[11px] text-muted">
                        #{t}
                      </span>
                    ))}
                    {n.links.map((l) => (
                      <a
                        key={l}
                        href={l}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-accent underline truncate max-w-[12rem]"
                      >
                        {hostnameOf(l) ?? l} ↗
                      </a>
                    ))}
                  </div>
                )}

                {n.provenance === "contributor" && (
                  <span className="text-[10px] uppercase tracking-wide text-muted">
                    contributor
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
