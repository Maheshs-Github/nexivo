import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height"> {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}

/**
 * Image with explicit dimensions (no layout shift), lazy loading by default and a quiet
 * gradient placeholder when the source is missing or fails to load.
 */
export function Img({ src, alt, width, height, priority, className, ...rest }: Props) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div role={alt ? "img" : undefined} aria-label={alt || undefined} style={{ aspectRatio: `${width} / ${height}` }}
        className={cn("bg-[radial-gradient(120%_80%_at_20%_10%,var(--brand-soft),transparent_60%),linear-gradient(135deg,var(--surface),var(--surface-2))]", className)} />
    );
  }
  return (
    <img src={src} alt={alt} width={width} height={height} loading={priority ? "eager" : "lazy"} decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"} onError={() => setFailed(true)} className={cn("object-cover", className)} {...rest} />
  );
}
