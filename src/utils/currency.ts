/**
 * Formats or normalizes currency string to standard symbol.
 * Defaults 'INR', 'RS', 'RS.', 'RUPEE', 'RUPEES' to '₹'.
 */
export const formatCurrencySymbol = (currency?: string | null): string => {
    if (!currency) return '₹';
    const trimmed = currency.trim();
    const upper = trimmed.toUpperCase();
    if (upper === 'INR' || upper === 'RS' || upper === 'RS.' || upper === 'RUPEE' || upper === 'RUPEES') {
        return '₹';
    }
    return trimmed || '₹';
};

export const formatCurrency = (amount: number | null | undefined, currency?: string | null, fractionDigits: number = 2): string => {
    const sym = formatCurrencySymbol(currency);
    const val = amount ?? 0;
    return `${sym}${val.toLocaleString('en-IN', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    })}`;
};
