import { useEffect, useState } from "react";
import { cn } from "../lib/cn";

interface Props {
  src?: string;
  alt: string;
  className?: string;
}

// Cover image with a broken-URL fallback. `failed` resets when src changes so
// a corrected URL gets a fresh load attempt.
export function CoverArt({ src, alt, className }: Props) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const show = src && !failed;
  return (
    <div
      className={cn(
        "bg-surface flex items-center justify-center overflow-hidden",
        className,
      )}
    >
      {show ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-muted text-[9px] uppercase tracking-wide">
          no art
        </span>
      )}
    </div>
  );
}
