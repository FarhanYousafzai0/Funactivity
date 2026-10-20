const SIZES = {
  sm: "size-10 border-2 text-sm",
  md: "size-16 border-[3px] text-xl",
  lg: "size-28 border-4 text-4xl",
  xl: "size-40 border-[5px] text-5xl",
} as const;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/**
 * Round profile photo with the white ring used on the AI SKOOL leaderboard.
 * Served by /photo/[id]; falls back to initials when a profile has no photo (seed data).
 */
export function Avatar({
  profile,
  size = "md",
  className = "",
}: {
  profile: { id: string; name: string; hasPhoto: boolean; photoVersion?: string };
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const base = `${SIZES[size]} aspect-square shrink-0 overflow-hidden rounded-full border-white bg-brand shadow-[0_12px_30px_rgba(0,182,108,0.18)] ${className}`;
  if (profile.hasPhoto) {
    // The image is a data URL stored in our own database, so next/image optimisation has nothing to add.
    const version = profile.photoVersion ? `?v=${encodeURIComponent(profile.photoVersion)}` : "";
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`/photo/${profile.id}${version}`} alt={profile.name} className={`${base} block object-cover object-top`} loading="lazy" />;
  }
  return (
    <div className={`${base} flex items-center justify-center font-black text-ink`} aria-label={profile.name}>
      {initials(profile.name) || "?"}
    </div>
  );
}
