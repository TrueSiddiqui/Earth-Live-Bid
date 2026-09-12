import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AuctionDetailClient } from './_components/auction-detail-client';

export const dynamic = 'force-dynamic';

export default async function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as any;
  if (user?.status !== 'approved' && user?.role !== 'admin') redirect('/dashboard');

  const auction = await prisma.auction.findUnique({
    where: { id },
    include: {
      bids: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { fullName: true, tier: true } }, syndicate: { select: { name: true } } },
      },
    },
  });

  if (!auction) redirect('/auctions');

  // Get syndicates user leads
  const userSyndicates = await prisma.syndicate.findMany({
    where: { creatorId: user?.id, isLocked: true },
    select: { id: true, name: true, poolTotal: true },
  });

  return (
    <AuctionDetailClient
      auction={{
        id: auction?.id ?? '',
        assetName: auction?.assetName ?? '',
        category: auction?.category ?? '',
        description: auction?.description ?? '',
        imageUrl: auction?.imageUrl ?? '',
        reservePrice: auction?.reservePrice ?? 0,
        currentBid: auction?.currentBid ?? 0,
        bidCount: auction?.bidCount ?? 0,
        endsAt: auction?.endsAt?.toISOString?.() ?? '',
        tierRequired: auction?.tierRequired ?? null,
        status: auction?.status ?? 'active',
      }}
      recentBids={(auction?.bids ?? []).map((b: any) => ({
        id: b?.id ?? '',
        amount: b?.amount ?? 0,
        bidderName: b?.syndicate?.name ?? b?.user?.fullName ?? 'Anonymous',
        bidderTier: b?.user?.tier ?? null,
        createdAt: b?.createdAt?.toISOString?.() ?? '',
      }))}
      userTier={user?.tier ?? null}
      userSyndicates={(userSyndicates ?? []).map((s: any) => ({
        id: s?.id ?? '',
        name: s?.name ?? '',
        poolTotal: s?.poolTotal ?? 0,
      }))}
    />
  );
}
