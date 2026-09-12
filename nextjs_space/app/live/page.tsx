import { prisma } from '@/lib/prisma';
import { LiveClient } from './_components/live-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Watch Live · The Colors & The Bidding — Top G Deception Bids on Planet Earth.',
  description:
    'Open to the whole world. Watch the live bidding for Earth\'s resources and discover the meaning behind our colors — the moonlight, the gold of the Dome of the Rock, and the green of Masjid an-Nabawi. The bidding does not end until further notice.',
};

export default async function LivePage() {
  const auctions = await prisma.auction.findMany({
    where: { status: 'active' },
    orderBy: { currentBid: 'desc' },
    include: {
      _count: { select: { bids: true } },
      bids: {
        orderBy: { amount: 'desc' },
        take: 1,
        include: { syndicate: { select: { name: true } } },
      },
    },
  });

  const totalPool = (auctions ?? []).reduce(
    (sum: number, a: any) => sum + (a?.currentBid ?? 0),
    0,
  );
  const totalBids = (auctions ?? []).reduce(
    (sum: number, a: any) => sum + (a?._count?.bids ?? 0),
    0,
  );

  return (
    <LiveClient
      auctions={(auctions ?? []).map((a: any) => ({
        id: a?.id ?? '',
        assetName: a?.assetName ?? '',
        category: a?.category ?? '',
        description: a?.description ?? '',
        imageUrl: a?.imageUrl ?? '',
        currentBid: a?.currentBid ?? 0,
        bidCount: a?._count?.bids ?? a?.bidCount ?? 0,
        leader: a?.bids?.[0]?.syndicate?.name ?? null,
      }))}
      totalPool={totalPool}
      totalBids={totalBids}
    />
  );
}
