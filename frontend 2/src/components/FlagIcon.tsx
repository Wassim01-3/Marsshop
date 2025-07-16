import { Language } from "@/types";

interface FlagIconProps {
  language: Language;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const flagUrls: Record<Language, string> = {
  en: "https://flagcdn.com/us.svg",
  fr: "https://flagcdn.com/fr.svg",
  ar: "https://flagcdn.com/sa.svg",
};

const flagNames: Record<Language, string> = {
  en: "United States",
  fr: "France",
  ar: "Saudi Arabia",
};

const sizeClasses = {
  sm: "w-5 h-4",
  md: "w-6 h-4",
  lg: "w-8 h-6",
};

export const FlagIcon = ({
  language,
  className = "",
  size = "md",
}: FlagIconProps) => {
  const baseClasses = `${sizeClasses[size]} object-cover rounded border border-gray-300 shadow-sm transition-all duration-200 hover:shadow-md`;

  return (
    <img
      src={flagUrls[language]}
      alt={`${flagNames[language]} flag`}
      className={`${baseClasses} ${className}`}
      loading="lazy"
      onError={(e) => {
        // Fallback to PNG if SVG fails
        const target = e.target as HTMLImageElement;
        if (target.src.includes(".svg")) {
          target.src = `https://flagcdn.com/24x18/${language === "en" ? "us" : language === "ar" ? "sa" : language}.png`;
        }
      }}
    />
  );
};
