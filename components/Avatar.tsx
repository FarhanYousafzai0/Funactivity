const SIZES = {
  sm: "size-10 text-sm",
  md: "size-16 text-xl",
  lg: "size-28 text-4xl",
  xl: "size-40 text-5xl",
} as const;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/** Profile photo served by /photo/[id]; falls back to initials when a profile has none (seed data). */
export function Avatar({
  profile,
  size = "md",
  className = "",
}: {
  profile: { id: string; name: string; hasPhoto: boolean };
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const base = `${SIZES[size]} shrink-0 rounded-full border-2 border-white bg-mint shadow-[0_8px_24px_rgba(7,17,13,0.12)] ${className}`;
  if (profile.hasPhoto) {
    // The image is a data URL stored in our own database, so next/image optimisation has nothing to add.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`/photo/${profile.id}`} alt={profile.name} className={`${base} object-cover`} loading="lazy" />;
  }
  return (
    <div className={`${base} flex items-center justify-center font-bold text-brand-deep`} aria-label={profile.name}>
      {initials(profile.name) || "?"}
    </div>
  );
}
