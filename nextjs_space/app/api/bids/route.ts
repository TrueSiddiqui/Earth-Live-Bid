export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/access';
import { apiError, ApiError } from '@/lib/api-error';
import { money, isVerified } from '@/lib/verification';
import { getTierLabel } from '@/lib/utils';
export async function POST(req: Request) {
  try {
    const user = await currentUser('member');
    const { auctionId, amount, syndicateId } = z.object({ auctionId: z.string().min(1), amount: money, syndicateId: z.string().min(1).nullable().optional() }).parse(await req.json());
    await prisma.$transaction(async tx => {
      const member = await tx.user.findUnique({ where: { id: user.id }, include: { application: true } });
      if (member?.status !== 'approved' || !isVerified(member.application)) throw new ApiError('Verification required', 403);
      const auction = await tx.auction.findUnique({ where: { id: auctionId } });
      if (!auction) throw new ApiError('Auction not found', 404);
      if (auction.status !== 'active') throw new ApiError('Auction is closed');
      if (amount <= auction.currentBid || amount < auction.reservePrice) throw new ApiError('Bid must exceed the current bid and meet the reserve');
      const order: Record<string, number> = { Millionaire: 1, Billionaire: 2, Titan: 3 };
      if (auction.tierRequired && (!(auction.tierRequired in order) || (order[member.tier ?? ''] ?? 0) < order[auction.tierRequired])) throw new ApiError(`Requires ${getTierLabel(auction.tierRequired)} tier or above`, 403);
      if (syndicateId) {
        const syndicate = await tx.syndicate.findUnique({ where: { id: syndicateId } });
        if (!syndicate || syndicate.creatorId !== user.id) throw new ApiError('Only the syndicate leader may place its bids', 403);
        if (!syndicate.isLocked) throw new ApiError('Close syndicate pledges before bidding');
        if (amount > syndicate.poolTotal) throw new ApiError('Bid exceeds declared syndicate pledges; pledges are not funded cash');
      }
      const updated = await tx.auction.updateMany({ where: { id: auctionId, status: 'active', currentBid: auction.currentBid }, data: { currentBid: amount, bidCount: { increment: 1 } } });
      if (!updated.count) throw new ApiError('Another bid arrived. Refresh and try again.', 409);
      await tx.bid.create({ data: { auctionId, amount, userId: user.id, syndicateId: syndicateId ?? null } });
    }, { isolationLevel: 'Serializable' });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) { return apiError(error); }
}
