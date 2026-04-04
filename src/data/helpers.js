// Fiyat formatlama: 1250 → "1.250 ₺"
export const formatPrice = (n) => n.toLocaleString("tr-TR") + " ₺";
