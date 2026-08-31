import React, { useState } from "react";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  alt?: string;
}

// Generate deterministic background color from name string
function getAvatarColor(name: string): { bg: string; text: string; border: string } {
  const colors = [
    { bg: "bg-indigo-600 dark:bg-indigo-700", text: "text-white", border: "border-indigo-400 dark:border-indigo-600" },
    { bg: "bg-emerald-600 dark:bg-emerald-700", text: "text-white", border: "border-emerald-400 dark:border-emerald-600" },
    { bg: "bg-amber-600 dark:bg-amber-700", text: "text-white", border: "border-amber-400 dark:border-amber-600" },
    { bg: "bg-blue-600 dark:bg-blue-700", text: "text-white", border: "border-blue-400 dark:border-blue-600" },
    { bg: "bg-violet-600 dark:bg-violet-700", text: "text-white", border: "border-violet-400 dark:border-violet-600" },
    { bg: "bg-rose-600 dark:bg-rose-700", text: "text-white", border: "border-rose-400 dark:border-rose-600" },
    { bg: "bg-teal-600 dark:bg-teal-700", text: "text-white", border: "border-teal-400 dark:border-teal-600" },
    { bg: "bg-cyan-700 dark:bg-cyan-800", text: "text-white", border: "border-cyan-400 dark:border-cyan-600" },
  ];

  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Extract clean 1-2 letter initials, ignoring common prefixes like Mr., Mrs., Dr.
export function getInitials(name: string): string {
  if (!name || typeof name !== "string") return "?";

  // Clean title prefixes
  const clean = name
    .replace(/^(Mr\.|Mrs\.|Miss|Ms\.|Dr\.|Rev\.|Madam|Master|Prof\.)\s+/i, "")
    .trim();

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name.charAt(0).toUpperCase() || "?";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = "md",
  className = "",
  alt,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs font-semibold",
    md: "w-9 h-9 text-xs font-bold",
    lg: "w-10 h-10 text-sm font-bold",
    xl: "w-12 h-12 text-base font-bold",
    "2xl": "w-16 h-16 text-xl font-extrabold",
  }[size];

  const initials = getInitials(name);
  const colorTheme = getAvatarColor(name);
  const hasValidSrc = Boolean(src && src.trim() && !imageError);

  if (hasValidSrc) {
    return (
      <img
        src={src!}
        alt={alt || name}
        onError={() => setImageError(true)}
        className={`rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 ${sizeClasses} ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      title={name}
      className={`rounded-full flex items-center justify-center shrink-0 tracking-wider select-none border font-sans ${colorTheme.bg} ${colorTheme.text} ${colorTheme.border} ${sizeClasses} ${className}`}
    >
      <span>{initials}</span>
    </div>
  );
};
