import { z } from 'zod';

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
export const DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const money = z.number().finite().positive().max(1_000_000_000_000_000).refine(n => Math.abs(n * 100 - Math.round(n * 100)) < 0.01, 'Use at most two decimal places');
const text = z.string().trim().min(2).max(200);
export const applicationSchema = z.object({
  legalName: text, nationality: text, countryResidence: text,
  dateOfBirth: z.string().date().refine(d => d < new Date().toISOString().slice(0, 10), 'Invalid date of birth'),
  passportPath: z.string().min(1).max(1000), bankDocPath: z.string().min(1).max(1000),
  declaredNetWorthUsd: money.refine(n => n >= 1_000_000, 'Minimum qualifying net worth is USD 1,000,000'),
  valuationDate: z.string().date().refine(d => {
    const age = Date.now() - Date.parse(d);
    return age >= 0 && age <= 90 * 86400000;
  }, 'Valuation must be dated within the past 90 days'),
  valuationNotes: z.string().trim().min(20).max(4000),
  sourceOfWealth: z.string().trim().min(10).max(4000),
  primaryAssetClass: text, bankName: text, bankCountry: text,
  swiftCode: z.string().trim().max(50).optional().default(''),
  acceptTerms: z.literal(true),
});
export const reviewSchema = z.object({
  applicationId: z.string().min(1),
  action: z.enum(['approve', 'reject', 'request_info']),
  note: z.string().trim().min(10).max(4000),
  identityChecked: z.boolean().default(false),
  wealthChecked: z.boolean().default(false),
  authenticityChecked: z.boolean().default(false),
});
export function wealthRange(amount: number) {
  if (amount >= 1_000_000_000) return '$1B+';
  if (amount >= 100_000_000) return '$100M-$1B';
  if (amount >= 10_000_000) return '$10M-$100M';
  return '$1M-$10M';
}
export function isVerified(application: {
  status: string; identityChecked: boolean; wealthChecked: boolean; authenticityChecked: boolean;
  verifiedUntil: Date | null; attestedAt: Date | null; declaredNetWorthUsd: number | null;
} | null | undefined) {
  return !!application && application.status === 'approved' && application.identityChecked && application.wealthChecked && application.authenticityChecked &&
    !!application.attestedAt && (application.declaredNetWorthUsd ?? 0) >= 1_000_000 && !!application.verifiedUntil && application.verifiedUntil > new Date();
}
