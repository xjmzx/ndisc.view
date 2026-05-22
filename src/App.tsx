import { useEffect, useMemo, useState } from "react";
import { Home, KeyRound, LogIn } from "lucide-react";
import { matchesSearch, npubToHex, type Release } from "./lib/nostr";
import { OWNER_NPUB } from "./config";
import { useReleases } from "./hooks/useReleases";
import { useProfile } from "./hooks/useProfile";
import { useSigner } from "./hooks/useSigner";
import { ReleaseCard } from "./components/ReleaseCard";
import { ReleaseDetail } from "./components/ReleaseDetail";
import { LoginModal } from "./components/LoginModal";
import { Footer } from "./components/Footer";

type Theme = "fizx" | "upleb";
const THEME_KEY = "ndisc-mobile.theme";

export default function App() {
  // The owner npub is fixed config; decode to hex once.
  const hex = useMemo(() => {
    try {
      return npubToHex(OWNER_NPUB);
    } catch {
      return undefined;
    }
  }, []);

  const { releases, loading } = useReleases(hex);
  const profile = useProfile(hex);
  const { status, logout } = useSigner();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Release | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  // Colour theme — toggled by tapping the ndisc title, mirrors the desktop.
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem(THEME_KEY) === "upleb" ? "upleb" : "fizx";
    } catch {
      return "fizx";
    }
  });
  useEffect(() => {
    document.documentElement.classList.toggle("theme-upleb", theme === "upleb");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const filtered = useMemo(
    () => releases.filter((r) => matchesSearch(r, query)),
    [releases, query],
  );

  const ownerName =
    profile?.display_name || profile?.name || "discography";

  // Home — back to the list, search cleared.
  function goHome() {
    setSelected(null);
    setQuery("");
  }

  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col">
      <header
        className="sticky top-0 z-20 bg-bg/95 backdrop-blur border-b
                   border-surface px-4 pt-[env(safe-area-inset-top)]"
      >
        {/* Permanent bar — stays on screen in both the list and detail view. */}
        <div className="flex items-center justify-between gap-3 py-3">
          <button
            type="button"
            onClick={() =>
              setTheme((t) => (t === "fizx" ? "upleb" : "fizx"))
            }
            title="Switch colour theme"
            aria-label="Switch colour theme"
            className="text-xl font-bold tracking-tight leading-none
                       transition-opacity hover:opacity-70"
          >
            n<span className="text-accent">disc</span>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-muted truncate">{ownerName}</span>
            {status === "in" ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Log out of Nostr?")) logout();
                }}
                title="Signed in — tap to log out"
                aria-label="Signed in — tap to log out"
                className="shrink-0 p-2 rounded-md bg-accent/20 text-accent
                           hover:bg-accent hover:text-bg transition-colors"
              >
                <KeyRound size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                title="Log in with a Nostr signer"
                aria-label="Log in with a Nostr signer"
                className="shrink-0 p-2 rounded-md bg-mauve/15 text-mauve
                           hover:bg-mauve hover:text-bg transition-colors"
              >
                <LogIn size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={goHome}
              title="Home"
              aria-label="Home"
              className="shrink-0 p-2 rounded-md bg-mauve/15 text-mauve
                         hover:bg-mauve hover:text-bg transition-colors"
            >
              <Home size={16} />
            </button>
          </div>
        </div>
        {/* Contextual row beneath the bar — search in list view, back in
            detail view. */}
        {selected ? (
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="block w-full text-left text-sm font-medium text-accent
                       pb-3"
          >
            ‹ back
          </button>
        ) : (
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search releases…"
            spellCheck={false}
            className="w-full mb-3 px-3 py-2 rounded-lg bg-surface text-fg
                       text-sm outline-none placeholder:text-muted"
          />
        )}
      </header>

      {selected ? (
        <ReleaseDetail
          release={selected}
          onRequireLogin={() => setLoginOpen(true)}
        />
      ) : (
        <main className="flex-1 px-4 py-3">
          {loading && releases.length === 0 ? (
            <p className="text-muted text-sm py-12 text-center">loading…</p>
          ) : releases.length === 0 ? (
            <p className="text-muted text-sm py-12 text-center">
              no releases found
            </p>
          ) : (
            <>
              <p className="text-[11px] text-muted tabular-nums mb-2">
                {filtered.length}
                {query.trim() ? ` of ${releases.length}` : ""} releases
              </p>
              <ul className="flex flex-col gap-2">
                {filtered.map((r) => (
                  <ReleaseCard
                    key={r.d}
                    release={r}
                    onSelect={() => setSelected(r)}
                  />
                ))}
                {filtered.length === 0 && (
                  <li className="text-muted text-sm py-8 text-center">
                    no matches
                  </li>
                )}
              </ul>
            </>
          )}
        </main>
      )}

      <Footer />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
