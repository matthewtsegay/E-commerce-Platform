/** Free delivery threshold in ETB (subtotal, before shipping). */
export const FREE_SHIPPING_MIN_ETB = 8_000;

/** Standard delivery fee in ETB when below free-shipping threshold. */
export const STANDARD_SHIPPING_ETB = 250;

export function computeShippingEtb(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_MIN_ETB ? 0 : STANDARD_SHIPPING_ETB;
}
