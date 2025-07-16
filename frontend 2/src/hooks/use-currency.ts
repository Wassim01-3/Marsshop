import { useLanguage } from "@/contexts/LanguageContext";

export const useCurrency = () => {
  const { language, t } = useLanguage();

  const formatPrice = (price: number): string => {
    const symbol = t("currency.symbol");
    if (typeof price !== "number" || isNaN(price)) return "";
    // Use fr-FR for comma decimal separator, always 3 decimals
    let formatted = price.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    // Remove decimals if all are zero
    if (/,[0]{3}$/.test(formatted)) {
      formatted = formatted.replace(/,[0]{3}$/, "");
    }
    return `${formatted} ${symbol}`;
  };

  const getCurrencySymbol = (): string => {
    return t("currency.symbol");
  };

  return {
    formatPrice,
    getCurrencySymbol,
  };
};
