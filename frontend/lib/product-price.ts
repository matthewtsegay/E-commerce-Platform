import type { Product } from '@/lib/types';

/** Unit price used for cart math (sale price when applicable). */
export function getEffectiveUnitPrice(product: Product): number {
  const sale =
    product.is_on_sale &&
    product.discounted_price != null &&
    product.discounted_price > 0
      ? Number(product.discounted_price)
      : null;
  if (sale != null && sale > 0) return sale;
  return Number(product.unit_price) || 0;
}
