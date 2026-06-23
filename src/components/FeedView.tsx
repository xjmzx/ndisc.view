// Curated feed — the third top-level view (alongside discography + stats). It
// will show a curated list of picks / matching interests / new releases pulled
// from a JSON feed. The feed spec (source URL + item shape) is still being
// defined; until it's wired this renders a placeholder. Kept as its own
// component so dropping in a fetch hook + item list is a small, localised
// change.
export function FeedView() {
  return (
    <main className="flex-1 px-4 py-3">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-sm text-fg">
          curated <span className="text-muted">/ feed</span>
        </h2>
      </div>
      <div className="py-16 flex flex-col items-center gap-2 text-center">
        <p className="text-sm text-fg/70">Curated picks &amp; new releases</p>
        <p className="text-xs text-muted max-w-xs leading-relaxed">
          A hand-picked feed of releases matching your interests — coming soon.
        </p>
      </div>
    </main>
  );
}
