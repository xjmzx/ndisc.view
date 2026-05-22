import { useState } from "react";
import { useSigner } from "../hooks/useSigner";

interface Props {
  open: boolean;
  onClose: () => void;
}

// Bottom-sheet login: paste a NIP-46 bunker:// connection string from a
// remote signer. The nsec never reaches this app.
export function LoginModal({ open, onClose }: Props) {
  const { login, status, error } = useSigner();
  const [input, setInput] = useState("");
  const connecting = status === "connecting";

  if (!open) return null;

  async function onConnect() {
    try {
      await login(input);
      setInput("");
      onClose();
    } catch {
      /* error surfaces via signer.error */
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center
                 justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-surface border border-surface
                   p-4 flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sm font-semibold">Connect a Nostr signer</h2>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="bunker://…"
          rows={3}
          spellCheck={false}
          autoFocus
          className="w-full px-3 py-2 rounded-lg bg-bg text-fg text-xs
                     font-mono outline-none border border-surfaceHover
                     focus:border-accent/50 placeholder:text-muted resize-none"
        />
        <p className="text-[11px] text-muted leading-snug">
          Paste a <span className="font-mono">bunker://</span> connection
          string from a remote signer — nsec.app, or Amber in bunker mode.
          Your secret key stays in the signer.
        </p>
        {error && <p className="text-[11px] text-red-400">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-sm text-muted"
          >
            cancel
          </button>
          <button
            type="button"
            onClick={onConnect}
            disabled={connecting || !input.trim()}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-mauve
                       text-bg disabled:opacity-40"
          >
            {connecting ? "connecting…" : "connect"}
          </button>
        </div>
      </div>
    </div>
  );
}
