// The discography this viewer shows — the ndisc owner's Nostr identity.
// Mirrors glmps's config; the mobile viewer is another read-only consumer of
// the same release.v1 events (see schema/release.v1.json).
export const OWNER_NPUB =
  "npub1j9kztnc85ednd7ncqhe37ag0evnltn8z6wd84jfqx4ts4gn89gks0vxesa";

export const DEFAULT_RELAYS = [
  "wss://relay.fizx.uk",
  "wss://nos.lol",
  "wss://relay.primal.net",
] as const;

export const RELEASE_KIND = 31237;
