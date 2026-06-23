import { useEffect, useMemo, useRef, useState } from "react";
import { SimplePool, type Event as NostrEvent } from "nostr-tools";
import { useRelays } from "./useRelays";

// Curated feed — kind:31238 notes authored by the owner (and, when present,
// registry-approved contributors), each optionally pointing at a kind:31237
// release. Implements the trust gate from the glmps/ndisc interaction spec
// (feed-resolve.mjs) + the kind:5 delete handling from glmps-feed-subscribe.js.
const FEED_KIND = 31238;
const REGISTRY_KIND = 30000; // NIP-51 people set — who may contribute
const REGISTRY_D = "glmps:contributors";
const APPROVAL_KIND = 4550; // NIP-72 post approval — which posts are blessed

export type FeedNote = {
  address: string; // 31238:<pubkey>:<d>
  d: string;
  provenance: "owner" | "contributor";
  release?: string; // `a` tag -> 31237:<ownerhex>:<release-d>
  title: string;
  body: string;
  images: string[]; // first = lead
  links: string[];
  topics: string[];
  publishedAt: number;
  createdAt: number;
};

const tag = (ev: NostrEvent, k: string) => ev.tags.find((t) => t[0] === k)?.[1];
const all = (ev: NostrEvent, k: string) =>
  ev.tags.filter((t) => t[0] === k && t[1]).map((t) => t[1] as string);

// Owner notes always show; contributor notes only if registered AND (when
// requireApproval) owner-signed-off. Dedupe by address (latest created_at),
// drop addresses tombstoned by a kind:5.
function resolveFeed(
  events: NostrEvent[],
  owner: string,
  requireApproval = true,
): FeedNote[] {
  const registry = events
    .filter(
      (e) =>
        e.kind === REGISTRY_KIND &&
        e.pubkey === owner &&
        tag(e, "d") === REGISTRY_D,
    )
    .sort((a, b) => b.created_at - a.created_at)[0];
  const allowed = new Set(registry ? all(registry, "p") : []);

  const approved = new Set(
    events
      .filter((e) => e.kind === APPROVAL_KIND && e.pubkey === owner)
      .map((e) => tag(e, "a"))
      .filter((a): a is string => Boolean(a)),
  );

  const deleted = new Set<string>();
  for (const e of events) {
    if (e.kind !== 5) continue;
    for (const t of e.tags) {
      if (t[0] === "a" && t[1]?.startsWith(`${FEED_KIND}:`)) deleted.add(t[1]);
    }
  }

  const byAddr = new Map<string, FeedNote>();
  for (const ev of events) {
    if (ev.kind !== FEED_KIND) continue;
    const d = tag(ev, "d");
    if (!d) continue;
    const address = `${FEED_KIND}:${ev.pubkey}:${d}`;
    if (deleted.has(address)) continue;

    let provenance: FeedNote["provenance"];
    if (ev.pubkey === owner) provenance = "owner";
    else if (!allowed.has(ev.pubkey)) continue; // not registered
    else if (requireApproval && !approved.has(address)) continue; // not signed off
    else provenance = "contributor";

    const note: FeedNote = {
      address,
      d,
      provenance,
      release: tag(ev, "a"),
      title: tag(ev, "title") ?? "",
      body: ev.content,
      images: all(ev, "image"),
      links: all(ev, "r"),
      topics: all(ev, "t"),
      publishedAt: Number(tag(ev, "published_at") ?? ev.created_at),
      createdAt: ev.created_at,
    };
    const prev = byAddr.get(address);
    if (!prev || ev.created_at > prev.createdAt) byAddr.set(address, note);
  }
  return [...byAddr.values()].sort((a, b) => b.publishedAt - a.publishedAt);
}

// Subscribes to the owner's feed notes + registry + approvals + deletes, and
// returns the trust-resolved, deduped list. First pass fetches the owner's
// events only (covers owner notes + the registry + sign-offs); fetching
// contributor-authored notes is a follow-up once the registry is known.
export function useFeed(ownerHex: string | undefined) {
  const { relays } = useRelays();
  const [notes, setNotes] = useState<FeedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const eventsRef = useRef<Map<string, NostrEvent>>(new Map());

  useEffect(() => {
    if (!ownerHex) return;
    eventsRef.current = new Map();
    setNotes([]);
    setLoading(true);

    const pool = new SimplePool();
    const recompute = () =>
      setNotes(resolveFeed([...eventsRef.current.values()], ownerHex));

    const sub = pool.subscribeMany(
      relays,
      {
        kinds: [FEED_KIND, REGISTRY_KIND, APPROVAL_KIND, 5],
        authors: [ownerHex],
      },
      {
        onevent(ev) {
          eventsRef.current.set(ev.id, ev);
          recompute();
        },
        oneose() {
          setLoading(false);
        },
      },
    );

    // Stop showing "loading" if no relay responds.
    const t = setTimeout(() => setLoading(false), 5000);

    return () => {
      clearTimeout(t);
      sub.close();
      pool.close(relays);
    };
  }, [ownerHex, relays]);

  return useMemo(() => ({ notes, loading }), [notes, loading]);
}
