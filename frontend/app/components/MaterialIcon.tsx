interface MaterialIconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

export default function MaterialIcon({ name, className = "", filled = false }: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? "filled" : ""} ${className}`}
      aria-hidden
    >
      {name}
    </span>
  );
}
