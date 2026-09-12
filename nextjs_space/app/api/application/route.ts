export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/access';
import { apiError, ApiError } from '@/lib/api-error';
import { applicationSchema, isVerified, wealthRange } from '@/lib/verification';
import { getTierFromNetWorth } from '@/lib/utils';
import { sealVerificationFile } from '@/lib/verification-files';

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const { acceptTerms, ...data } = applicationSchema.parse(await req.json());
    if (data.passportPath === data.bankDocPath) throw new ApiError('Provide separate identity and financial evidence');
    if (user.application && (user.application.status === 'pending' || isVerified(user.application))) throw new ApiError('Application already submitted or membership is currently verified', 409);
    const [passportPath, bankDocPath] = await Promise.all([sealVerificationFile(user.id, data.passportPath), sealVerificationFile(user.id, data.bankDocPath)]);
    const result = await prisma.$transaction(async tx => {
      const existing = await tx.application.findUnique({ where: { userId: user.id } });
      if (existing && (existing.status === 'pending' || isVerified(existing))) throw new ApiError('Application already submitted or membership is currently verified', 409);
      const netWorthRange = wealthRange(data.declaredNetWorthUsd);
      const values = { ...data, passportPath, bankDocPath, netWorthRange, tier: getTierFromNetWorth(netWorthRange), status: 'pending', attestedAt: new Date(), passportPublic: false, bankDocPublic: false, identityChecked: false, wealthChecked: false, authenticityChecked: false, reviewedBy: null, reviewedAt: null, verifiedUntil: null, adminNote: null };
      const application = await tx.application.upsert({ where: { userId: user.id }, create: { userId: user.id, ...values }, update: values });
      await tx.user.update({ where: { id: user.id }, data: { status: 'pending' } });
      await tx.adminAction.create({ data: { action: existing ? 'resubmit' : 'submit', actorId: user.id, targetType: 'application', targetId: application.id } });
      return application;
    }, { isolationLevel: 'Serializable' });
    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (error) { return apiError(error); }
}
export async function GET() {
  try {
    const user = await currentUser();
    return NextResponse.json(user.application, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiError(error); }
}
