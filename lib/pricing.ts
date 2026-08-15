// Shared delivery weight-pricing rule.
//
// This is used both server-side (actual order pricing in lib/store.ts) and
// client-side (live price preview on the booking form), so importing this
// file must stay safe in the browser: no supabase client, no env vars.
//
// Business rule:
// - Any package weighing up to and including 3kg costs a flat Rs 300.
// - Every kg above 3kg adds Rs 100 on top of that Rs 300 base.
export const WEIGHT_THRESHOLD_KG = 3;
export const FLAT_RATE_UPTO_THRESHOLD = 300;
export const EXTRA_RATE_PER_KG_ABOVE_THRESHOLD = 100;

/**
 * Delivery weight charge for a single package (before multiplying by
 * quantity). Returns 0 for a missing/zero/negative weight so live previews
 * don't show a charge before the user has entered a weight.
 */
export function computeWeightCharge(weightKg: number): number {
  const w = Number.isFinite(weightKg) ? weightKg : 0;
  if (w <= 0) return 0;
  if (w <= WEIGHT_THRESHOLD_KG) return FLAT_RATE_UPTO_THRESHOLD;
  return (
    FLAT_RATE_UPTO_THRESHOLD +
    (w - WEIGHT_THRESHOLD_KG) * EXTRA_RATE_PER_KG_ABOVE_THRESHOLD
  );
}
