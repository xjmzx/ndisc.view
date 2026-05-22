import { CoverArt } from "./CoverArt";
import type { Release } from "../lib/nostr";

interface Props {
  release: Release;
  onSelect: () => void;
}

// One row in the discography list — cover thumb + artist / title / meta line.
export function ReleaseCard({ release, onSelect }: Props) {
  const meta = [release.year, release.formatGroup ?? release.format, release.label]
    .filter(Boolean)
    .join(" · ");
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="w-full flex items-center gap-3 p-2 rounded-lg bg-surface
                   active:bg-surfaceHover transition-colors text-left"
      >
        <CoverArt
          src={release.image}
          alt={release.title}
          className="shrink-0 w-14 h-14 rounded-md"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{release.artist}</p>
          <p className="text-sm text-fg/75 truncate">{release.title}</p>
          {meta && (
            <p className="text-[11px] text-muted truncate mt-0.5">{meta}</p>
          )}
        </div>
      </button>
    </li>
  );
}
