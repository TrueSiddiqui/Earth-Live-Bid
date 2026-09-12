export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/access';
import { apiError, ApiError } from '@/lib/api-error';
import { money } from '@/lib/verification';
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser('member');
    const { id } = await params;
    const { pledgeAmount } = z.object({ pledgeAmount: money }).parse(await req.json());
    await prisma.$transaction(async tx => {
      const syndicate = await tx.syndicate.findUnique({ where: { id }, include: { _count: { select: { members: true } } } });
      if (!syndicate) throw new ApiError('Syndicate not found', 404);
      if (syndicate.isLocked) throw new ApiError('Pledges are closed');
      if (syndicate._count.members >= syndicate.maxMembers) throw new ApiError('Syndicate is full');
      if (pledgeAmount < syndicate.minContribution) throw new ApiError('Pledge is below the minimum contribution');
      const existing = await tx.syndicateMember.findUnique({ where: { syndicateId_userId: { syndicateId: id, userId: user.id } } });
      if (existing) throw new ApiError('Already a member', 409);
      await tx.syndicateMember.create({ data: { syndicateId: id, userId: user.id, pledgeAmount } });
      await tx.syndicate.update({ where: { id }, data: { poolTotal: { increment: pledgeAmount } } });
    }, { isolationLevel: 'Serializable' });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) { return apiError(error); }
}
