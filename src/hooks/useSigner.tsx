import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  generateSecretKey,
  type EventTemplate,
  type VerifiedEvent,
} from "nostr-tools/pure";
import { BunkerSigner, parseBunkerInput } from "nostr-tools/nip46";

// NIP-46 remote-signer session. The user's nsec stays in their signer
// (nsec.app, Amber in bunker mode, …); this app only holds an ephemeral
// local key for the NIP-46 channel and asks the signer to sign events.
type Status = "out" | "connecting" | "in";

interface SignerCtx {
  status: Status;
  pubkey: string | null;
  error: string | null;
  login: (bunkerInput: string) => Promise<void>;
  logout: () => void;
  signEvent: (template: EventTemplate) => Promise<VerifiedEvent>;
}

const C = createContext<SignerCtx | null>(null);
const SESSION_KEY = "ndisc-mobile.signer";

function toHex(b: Uint8Array): string {
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}
function fromHex(h: string): Uint8Array {
  const m = h.match(/.{1,2}/g) ?? [];
  return new Uint8Array(m.map((x) => parseInt(x, 16)));
}

type Session = { clientKey: string; bunker: string };

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (typeof s?.clientKey === "string" && typeof s?.bunker === "string") {
      return s as Session;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function SignerProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("out");
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const signerRef = useRef<BunkerSigner | null>(null);

  const connect = useCallback(
    async (clientKey: Uint8Array, bunkerInput: string) => {
      setError(null);
      setStatus("connecting");
      const bp = await parseBunkerInput(bunkerInput);
      if (!bp) throw new Error("Not a valid bunker:// string or NIP-05 name.");
      const signer = BunkerSigner.fromBunker(clientKey, bp, {
        onauth: (url) => {
          try {
            window.open(url, "_blank", "noopener");
          } catch {
            /* ignore */
          }
        },
      });
      // connect() hangs forever if the signer is unreachable — cap the wait.
      await Promise.race([
        signer.connect(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("signer did not respond — is it online?")),
            25_000,
          ),
        ),
      ]);
      const pk = await signer.getPublicKey();
      signerRef.current = signer;
      setPubkey(pk);
      setStatus("in");
    },
    [],
  );

  const login = useCallback(
    async (bunkerInput: string) => {
      const input = bunkerInput.trim();
      if (!input) return;
      const clientKey = generateSecretKey();
      try {
        await connect(clientKey, input);
        try {
          localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ clientKey: toHex(clientKey), bunker: input }),
          );
        } catch {
          /* ignore */
        }
      } catch (e) {
        setStatus("out");
        setError(e instanceof Error ? e.message : String(e));
        throw e;
      }
    },
    [connect],
  );

  const logout = useCallback(() => {
    signerRef.current?.close().catch(() => {});
    signerRef.current = null;
    setPubkey(null);
    setStatus("out");
    setError(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const signEvent = useCallback(
    async (template: EventTemplate): Promise<VerifiedEvent> => {
      const s = signerRef.current;
      if (!s) throw new Error("not signed in");
      return s.signEvent(template);
    },
    [],
  );

  // Reconnect a persisted session on mount; on failure just present as
  // logged-out (the stored session is left for a manual retry).
  useEffect(() => {
    const s = loadSession();
    if (!s) return;
    connect(fromHex(s.clientKey), s.bunker).catch(() => {
      setStatus("out");
      setError(null);
    });
  }, [connect]);

  const value = useMemo<SignerCtx>(
    () => ({ status, pubkey, error, login, logout, signEvent }),
    [status, pubkey, error, login, logout, signEvent],
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useSigner(): SignerCtx {
  const v = useContext(C);
  if (!v) throw new Error("useSigner must be used inside <SignerProvider>");
  return v;
}
