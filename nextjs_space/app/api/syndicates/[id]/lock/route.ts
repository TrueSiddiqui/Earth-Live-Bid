export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/access';
import { apiError, ApiError } from '@/lib/api-error';
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser('member');
    const { id } = await params;
    const result = await prisma.syndicate.updateMany({ where: { id, creatorId: user.id }, data: { isLocked: true } });
    if (!result.count) throw new ApiError('Only the syndicate leader can close pledges', 403);
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
