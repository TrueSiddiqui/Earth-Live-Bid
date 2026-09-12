import { prisma } from '@/lib/prisma';
import { LandingClient } from './_components/landing-client';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [auctionCount, syndicateCount, totalPooled, auctions] = await Promise.all([
    prisma.auction.count({ where: { status: 'active' } }),
    prisma.syndicate.count(),
    prisma.syndicate.aggregate({ _sum: { poolTotal: true } }),
    prisma.auction.findMany({
      where: { status: 'active' },
      orderBy: { currentBid: 'desc' },
      take: 3,
    }),
  ]);

  return (
    <LandingClient
      stats={{
        totalPooled: totalPooled?._sum?.poolTotal ?? 0,
        activeAuctions: auctionCount ?? 0,
        activeSyndicates: syndicateCount ?? 0,
      }}
      featuredAuctions={auctions?.map((a: any) => ({
        id: a?.id ?? '',
        assetName: a?.assetName ?? '',
        category: a?.category ?? '',
        currentBid: a?.currentBid ?? 0,
        imageUrl: a?.imageUrl ?? '',
        endsAt: a?.endsAt?.toISOString?.() ?? '',
      })) ?? []}
    />
  );
}
