import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AuctionsClient } from './_components/auctions-client';

export const dynamic = 'force-dynamic';

export default async function AuctionsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as any;
  if (user?.status !== 'approved' && user?.role !== 'admin') redirect('/dashboard');

  const auctions = await prisma.auction.findMany({
    where: { status: 'active' },
    orderBy: { endsAt: 'asc' },
    include: { _count: { select: { bids: true } } },
  });

  return (
    <AuctionsClient
      auctions={(auctions ?? []).map((a: any) => ({
        id: a?.id ?? '',
        assetName: a?.assetName ?? '',
        category: a?.category ?? '',
        description: a?.description ?? '',
        imageUrl: a?.imageUrl ?? '',
        reservePrice: a?.reservePrice ?? 0,
        currentBid: a?.currentBid ?? 0,
        bidCount: a?._count?.bids ?? a?.bidCount ?? 0,
        endsAt: a?.endsAt?.toISOString?.() ?? '',
        tierRequired: a?.tierRequired ?? null,
      }))}
      userTier={user?.tier ?? null}
    />
  );
}
