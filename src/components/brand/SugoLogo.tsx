/**
 * SUGO wordmark — "Sell Ur GOlfballs"
 * The S, U, GO letters are oversized in the brand primary color; the
 * remaining letters render small and muted so the SUGO acronym pops.
 */
export function SugoLogo({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const scale = {
    sm: { big: "text-2xl", small: "text-[10px]" },
    md: { big: "text-3xl", small: "text-xs" },
    lg: { big: "text-5xl", small: "text-base" },
  }[size];

  const Big = ({ children }: { children: string }) => (
    <span className={`${scale.big} font-black leading-none text-primary`}>
      {children}
    </span>
  );
  const Small = ({ children }: { children: string }) => (
    <span
      className={`${scale.small} font-semibold tracking-[0.12em] leading-none text-muted-foreground`}
    >
      {children}
    </span>
  );

  return (
    <span
      aria-label="SUGO — sell ur golfballs"
      className={`inline-flex items-baseline gap-[2px] ${className}`}
    >
      <Big>S</Big>
      <Small>ell</Small>
      <span className="w-1" />
      <Big>U</Big>
      <Small>r</Small>
      <span className="w-1" />
      <Big>GO</Big>
      <Small>lfballs</Small>
    </span>
  );
}
