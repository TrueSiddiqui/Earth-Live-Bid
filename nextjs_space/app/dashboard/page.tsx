import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { isVerified } from '@/lib/verification';
import { DashboardClient } from './_components/dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const userId = (session.user as any)?.id;

  const [user, application, memberships, bids] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.application.findUnique({ where: { userId } }),
    prisma.syndicateMember.findMany({
      where: { userId },
      include: { syndicate: true },
    }),
    prisma.bid.findMany({
      where: { userId },
      include: { auction: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  const syndicatesCreated = await prisma.syndicate.findMany({
    where: { creatorId: userId },
    include: { _count: { select: { members: true } } },
  });

  return (
    <DashboardClient
      user={{
        id: user?.id ?? '',
        fullName: user?.fullName ?? '',
        email: user?.email ?? '',
        role: user?.role ?? 'member',
        tier: user?.tier ?? null,
        status: user?.status === 'approved' && !isVerified(application) ? 'pending' : user?.status ?? 'pending',
      }}
      application={application ? {
        id: application.id,
        status: application.status === 'approved' && !isVerified(application) ? 'renewal_required' : application.status,
        verifiedUntil: application.verifiedUntil?.toISOString() ?? null,
        tier: application.tier,
        adminNote: application.adminNote,
        createdAt: application.createdAt?.toISOString?.() ?? '',
      } : null}
      memberships={(memberships ?? []).map((m: any) => ({
        id: m?.id ?? '',
        pledgeAmount: m?.pledgeAmount ?? 0,
        syndicate: {
          id: m?.syndicate?.id ?? '',
          name: m?.syndicate?.name ?? '',
          poolTotal: m?.syndicate?.poolTotal ?? 0,
          targetCategory: m?.syndicate?.targetCategory ?? '',
        },
      }))}
      syndicatesCreated={(syndicatesCreated ?? []).map((s: any) => ({
        id: s?.id ?? '',
        name: s?.name ?? '',
        poolTotal: s?.poolTotal ?? 0,
        memberCount: s?._count?.members ?? 0,
        targetCategory: s?.targetCategory ?? '',
      }))}
      bids={(bids ?? []).map((b: any) => ({
        id: b?.id ?? '',
        amount: b?.amount ?? 0,
        createdAt: b?.createdAt?.toISOString?.() ?? '',
        auction: {
          id: b?.auction?.id ?? '',
          assetName: b?.auction?.assetName ?? '',
          status: b?.auction?.status ?? '',
          currentBid: b?.auction?.currentBid ?? 0,
        },
      }))}
    />
  );
}
