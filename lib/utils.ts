export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const DEFAULT_ACCENT = "#4f46e5";

/** "#RRGGBB" -> "r g b" (space-separated channels, for `rgb(var(--x) / <alpha>)`). */
export function hexToRgbChannels(hex: string | null | undefined) {
  const value = hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : DEFAULT_ACCENT;
  const r = parseInt(value.slice(1, 3), 16);
  const g = parseInt(value.slice(3, 5), 16);
  const b = parseInt(value.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
}

export function resolveAccent(hex: string | null | undefined) {
  return hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : DEFAULT_ACCENT;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
