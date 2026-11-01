/** Tiny event bridge so any CTA can pre-fill the enquiry form. */
export const PREFILL_EVENT = "enquiry:prefill";

export type PrefillDetail = { eventType?: string; coverage?: string };

export function prefillEnquiry(detail: PrefillDetail) {
  window.dispatchEvent(new CustomEvent<PrefillDetail>(PREFILL_EVENT, { detail }));
}
