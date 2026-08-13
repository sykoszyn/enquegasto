interface TeamBadgeProps {
  name: string;
  color: string;
  size?: number;
}

function getInitials(name: string): string {
  const words = name.replace(/[^a-zA-Z0-9À-ÿ\s]/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Contraste de texto simple según el brillo del color de fondo
function textColorFor(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#000000";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0a0a0a" : "#ffffff";
}

export default function TeamBadge({ name, color, size = 32 }: TeamBadgeProps) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-display font-bold shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        color: textColorFor(color),
        fontSize: size * 0.38
      }}
    >
      {getInitials(name)}
    </div>
  );
}
