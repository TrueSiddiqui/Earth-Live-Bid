export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/access';
import { apiError } from '@/lib/api-error';
import { money } from '@/lib/verification';
export async function GET() {
  try {
    await currentUser('member');
    const syndicates = await prisma.syndicate.findMany({ orderBy: { poolTotal: 'desc' }, include: { _count: { select: { members: true } } } });
    return NextResponse.json(syndicates);
  } catch (error) { return apiError(error); }
}
export async function POST(req: Request) {
  try {
    const user = await currentUser('member');
    const data = z.object({ name: z.string().trim().min(3).max(120), description: z.string().trim().min(10).max(4000), targetCategory: z.string().trim().min(2).max(200), minContribution: money, maxMembers: z.number().int().min(2).max(1000) }).parse(await req.json());
    const syndicate = await prisma.syndicate.create({ data: { ...data, creatorId: user.id } });
    return NextResponse.json(syndicate, { status: 201 });
  } catch (error) { return apiError(error); }
}
