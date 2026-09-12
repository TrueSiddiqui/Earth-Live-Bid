import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SyndicatesClient } from './_components/syndicates-client';

export const dynamic = 'force-dynamic';

export default async function SyndicatesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as any;
  if (user?.status !== 'approved' && user?.role !== 'admin') redirect('/dashboard');

  const syndicates = await prisma.syndicate.findMany({
    orderBy: { poolTotal: 'desc' },
    include: {
      creator: { select: { fullName: true, tier: true } },
      _count: { select: { members: true } },
    },
  });

  return (
    <SyndicatesClient
      syndicates={(syndicates ?? []).map((s: any) => ({
        id: s?.id ?? '',
        name: s?.name ?? '',
        description: s?.description ?? '',
        targetCategory: s?.targetCategory ?? '',
        minContribution: s?.minContribution ?? 0,
        maxMembers: s?.maxMembers ?? 0,
        poolTotal: s?.poolTotal ?? 0,
        isLocked: s?.isLocked ?? false,
        memberCount: s?._count?.members ?? 0,
        creatorName: s?.creator?.fullName ?? 'Unknown',
        creatorTier: s?.creator?.tier ?? null,
      }))}
      userId={user?.id ?? ''}
    />
  );
}
