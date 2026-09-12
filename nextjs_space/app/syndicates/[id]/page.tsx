import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SyndicateDetailClient } from './_components/syndicate-detail-client';

export const dynamic = 'force-dynamic';

export default async function SyndicateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as any;
  if (user?.status !== 'approved' && user?.role !== 'admin') redirect('/dashboard');

  const syndicate = await prisma.syndicate.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, fullName: true, tier: true } },
      members: {
        include: { user: { select: { id: true, fullName: true, tier: true } } },
        orderBy: { pledgeAmount: 'desc' },
      },
    },
  });

  if (!syndicate) redirect('/syndicates');

  const isMember = syndicate?.members?.some((m: any) => m?.userId === user?.id) ?? false;
  const isCreator = syndicate?.creatorId === user?.id;

  return (
    <SyndicateDetailClient
      syndicate={{
        id: syndicate?.id ?? '',
        name: syndicate?.name ?? '',
        description: syndicate?.description ?? '',
        targetCategory: syndicate?.targetCategory ?? '',
        minContribution: syndicate?.minContribution ?? 0,
        maxMembers: syndicate?.maxMembers ?? 0,
        poolTotal: syndicate?.poolTotal ?? 0,
        isLocked: syndicate?.isLocked ?? false,
        creatorName: syndicate?.creator?.fullName ?? 'Unknown',
        creatorTier: syndicate?.creator?.tier ?? null,
      }}
      members={(syndicate?.members ?? []).map((m: any) => ({
        id: m?.id ?? '',
        fullName: m?.user?.fullName ?? '',
        tier: m?.user?.tier ?? null,
        pledgeAmount: m?.pledgeAmount ?? 0,
      }))}
      isMember={isMember}
      isCreator={isCreator}
    />
  );
}
