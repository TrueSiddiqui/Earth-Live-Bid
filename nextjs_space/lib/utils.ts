import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(0)}M`;
  }
  return `$${amount?.toLocaleString?.('en-US') ?? '0'}`;
}

// Preserve stored tier codes while correcting their public financial labels.
export function getTierLabel(tier: string | null | undefined): string {
  return tier === 'Billionaire' ? 'Centimillionaire' : tier === 'Titan' ? 'Billionaire · Titan' : tier ?? 'Unverified';
}

export function getTierColor(tier: string | null | undefined): string {
  switch (tier) {
    case 'Millionaire': return 'tier-millionaire';
    case 'Billionaire': return 'tier-billionaire';
    case 'Titan': return 'tier-titan';
    default: return 'bg-muted text-muted-foreground';
  }
}

export function getTierFromNetWorth(range: string): string {
  if (range === '$1B+') return 'Titan';
  if (range === '$100M-$1B') return 'Billionaire';
  return 'Millionaire';
}
