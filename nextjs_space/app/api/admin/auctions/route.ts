export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/access';
import { apiError } from '@/lib/api-error';
import { money } from '@/lib/verification';
const fields = z.object({ assetName: z.string().trim().min(3).max(200), category: z.string().trim().min(2).max(200), description: z.string().trim().min(10).max(10000), reservePrice: money, tierRequired: z.enum(['', 'Millionaire', 'Billionaire', 'Titan']).nullable().optional(), imageUrl: z.union([z.literal(''), z.string().url()]).optional() });
export async function POST(req: Request) {
  try {
    await currentUser('admin');
    const data = fields.parse(await req.json());
    const auction = await prisma.auction.create({ data: { ...data, tierRequired: data.tierRequired || null, imageUrl: data.imageUrl || null, endsAt: new Date() } });
    return NextResponse.json(auction, { status: 201 });
  } catch (error) { return apiError(error); }
}
export async function PUT(req: Request) {
  try {
    await currentUser('admin');
    const { id, ...data } = fields.partial().extend({ id: z.string().min(1), status: z.enum(['active', 'closed']).optional() }).strict().parse(await req.json());
    const auction = await prisma.auction.update({ where: { id }, data });
    return NextResponse.json(auction);
  } catch (error) { return apiError(error); }
}
