import { useState } from "react";

export type CycleFacet = {
  key: string;
  name: string; // display name, e.g. "genre"
  options: string[]; // values in display order (sorted by count)
  counts: Map<string, number>;
  selected: Set<string>;
  onToggle: (value: string) => void;
  labelFor?: (value: string) => string;
  colorFor?: (value: string) => string; // dot colour (genre)
};

// A single compact filter control for the sticky bar: tap the facet name to
// cycle facets (genre → label → country → decade), page values with ‹ ›, and
// tap the value to toggle it as a filter. The value shows its release count.
export function CycleFilter({ facets }: { facets: CycleFacet[] }) {
  const [facetIdx, setFacetIdx] = useState(0);
  // One value-cursor per facet so paging position survives a facet switch.
  const [idxs, setIdxs] = useState<number[]>(() => facets.map(() => 0));

  if (facets.length === 0) return null;
  const fi = facetIdx % facets.length;
  const facet = facets[fi];
  const n = facet.options.length;
  const vi = n > 0 ? ((idxs[fi] ?? 0) % n + n) % n : 0;
  const value = n > 0 ? facet.options[vi] : undefined;
  const on = value != null && facet.selected.has(value);

  const cycleFacet = () => setFacetIdx((i) => (i + 1) % facets.length);
  const step = (dir: number) =>
    setIdxs((prev) => {
      const next = [...prev];
      next[fi] = (idxs[fi] ?? 0) + dir;
      return next;
    });

  return (
    <div className="flex items-center gap-1 font-mono text-[11px]">
      <button
        type="button"
        onClick={cycleFacet}
        title="Switch filter category"
        className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded
                   bg-surface text-muted hover:text-fg transition-colors"
      >
        <span>{facet.name}</span>
        {facet.selected.size > 0 && (
          <span className="text-accent tabular-nums">{facet.selected.size}</span>
        )}
        <svg className="w-3 h-3 opacity-60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
          <path d="M2 8a6 6 0 0 1 10-4.5M14 8a6 6 0 0 1-10 4.5" strokeLinecap="round" />
          <path d="M12 1.5v2.5h-2.5M4 14.5v-2.5h2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => step(-1)}
        disabled={n === 0}
        aria-label="Previous value"
        className="shrink-0 px-1.5 py-1 rounded text-muted hover:text-fg disabled:opacity-30 transition-colors"
      >
        ‹
      </button>

      <button
        type="button"
        onClick={() => value != null && facet.onToggle(value)}
        disabled={value == null}
        title={value != null ? (on ? `Remove ${facet.name} filter` : `Filter by ${value}`) : undefined}
        className={
          "flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-2 py-1 " +
          "rounded transition-colors " +
          (on ? "bg-accent text-bg font-medium" : "bg-surface text-fg/80")
        }
      >
        {value == null ? (
          <span className="text-muted">no {facet.name}</span>
        ) : (
          <>
            {facet.colorFor && (
              <span
                className="w-2 h-2 rounded-full ring-1 ring-fg/10 shrink-0"
                style={{ backgroundColor: facet.colorFor(value) }}
                aria-hidden="true"
              />
            )}
            <span className="truncate">
              {facet.labelFor ? facet.labelFor(value) : value}
            </span>
            <span className={"tabular-nums shrink-0 " + (on ? "text-bg/70" : "text-muted")}>
              {facet.counts.get(value) ?? 0}
            </span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => step(1)}
        disabled={n === 0}
        aria-label="Next value"
        className="shrink-0 px-1.5 py-1 rounded text-muted hover:text-fg disabled:opacity-30 transition-colors"
      >
        ›
      </button>
    </div>
  );
}
