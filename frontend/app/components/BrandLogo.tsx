import Image from "next/image";

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export default function BrandLogo({
  size = 48,
  showText = true,
  subtitle,
  className = "",
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/logotipo.png"
        alt="Kimma"
        width={size}
        height={size}
        className="h-auto w-auto shrink-0 object-contain"
        style={{ maxHeight: size }}
        priority
      />
      {showText && (
        <div className="min-w-0 flex flex-col">
          <span className="font-headline text-xl font-bold text-primary">Kimma</span>
          {subtitle ? (
            <span className="truncate text-xs text-on-surface-variant/70">{subtitle}</span>
          ) : null}
        </div>
      )}
    </div>
  );
}
