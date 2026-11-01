/** Shared enquiry shape + validation (used by the form and the API route). */
export type Enquiry = {
  eventType: string;
  coverage: string;
  date: string;
  dateFlexible: boolean;
  venue: string;
  guests: string;
  budget: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  /** Honeypot: must stay empty. */
  website?: string;
};

export type EnquiryErrors = Partial<Record<keyof Enquiry, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEnquiry(e: Partial<Enquiry>): EnquiryErrors {
  const errors: EnquiryErrors = {};
  if (!e.eventType) errors.eventType = "Choose the type of event.";
  if (!e.name || e.name.trim().length < 2) errors.name = "Please tell us your name.";
  if (!e.email || !EMAIL.test(e.email.trim())) errors.email = "Enter a valid email so we can reply.";
  if (!e.dateFlexible && !e.date) errors.date = "Add a date, or tick “Date not set yet”.";
  const tooLong = (v: unknown, n: number) => typeof v === "string" && v.length > n;
  if (tooLong(e.message, 4000)) errors.message = "Please keep this under 4,000 characters.";
  if (tooLong(e.name, 120) || tooLong(e.venue, 200) || tooLong(e.phone, 40)) errors.name ??= "Some fields are too long.";
  return errors;
}
