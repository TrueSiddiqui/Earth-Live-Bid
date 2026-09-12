import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AdminClient } from './_components/admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as any;
  if (user?.role !== 'admin') redirect('/dashboard');

  const [applications, syndicates, auctions, recentBids] = await Promise.all([
    prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, fullName: true } } },
    }),
    prisma.syndicate.findMany({
      orderBy: { poolTotal: 'desc' },
      include: { _count: { select: { members: true } } },
    }),
    prisma.auction.findMany({ orderBy: { endsAt: 'asc' } }),
    prisma.bid.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { fullName: true } },
        syndicate: { select: { name: true } },
        auction: { select: { assetName: true } },
      },
    }),
  ]);

  return (
    <AdminClient
      applications={(applications ?? []).map((a: any) => ({
        id: a?.id ?? '',
        legalName: a?.legalName ?? '',
        nationality: a?.nationality ?? '',
        dateOfBirth: a?.dateOfBirth ?? '',
        countryResidence: a?.countryResidence ?? '',
        netWorthRange: a?.netWorthRange ?? '',
        tier: a?.tier ?? '',
        sourceOfWealth: a?.sourceOfWealth ?? '',
        primaryAssetClass: a?.primaryAssetClass ?? '',
        bankName: a?.bankName ?? '',
        bankCountry: a?.bankCountry ?? '',
        swiftCode: a?.swiftCode ?? '',
        status: a?.status ?? 'pending',
        adminNote: a?.adminNote ?? '',
        userId: a?.userId ?? '',
        userEmail: a?.user?.email ?? '',
        passportPath: a?.passportPath ?? null,
        bankDocPath: a?.bankDocPath ?? null,
        createdAt: a?.createdAt?.toISOString?.() ?? '',
        declaredNetWorthUsd: a.declaredNetWorthUsd, valuationDate: a.valuationDate, valuationNotes: a.valuationNotes,
        attestedAt: a.attestedAt?.toISOString() ?? null, verifiedUntil: a.verifiedUntil?.toISOString() ?? null, reviewedBy: a.reviewedBy,
      }))}
      syndicates={(syndicates ?? []).map((s: any) => ({
        id: s?.id ?? '',
        name: s?.name ?? '',
        targetCategory: s?.targetCategory ?? '',
        poolTotal: s?.poolTotal ?? 0,
        memberCount: s?._count?.members ?? 0,
        isLocked: s?.isLocked ?? false,
      }))}
      auctions={(auctions ?? []).map((a: any) => ({
        id: a?.id ?? '',
        assetName: a?.assetName ?? '',
        category: a?.category ?? '',
        reservePrice: a?.reservePrice ?? 0,
        currentBid: a?.currentBid ?? 0,
        bidCount: a?.bidCount ?? 0,
        endsAt: a?.endsAt?.toISOString?.() ?? '',
        status: a?.status ?? 'active',
        tierRequired: a?.tierRequired ?? null,
      }))}
      recentBids={(recentBids ?? []).map((b: any) => ({
        id: b?.id ?? '',
        amount: b?.amount ?? 0,
        bidderName: b?.syndicate?.name ?? b?.user?.fullName ?? 'Anonymous',
        auctionName: b?.auction?.assetName ?? '',
        createdAt: b?.createdAt?.toISOString?.() ?? '',
      }))}
    />
  );
}
