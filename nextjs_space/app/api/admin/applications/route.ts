export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/access';
import { apiError, ApiError } from '@/lib/api-error';
import { reviewSchema, wealthRange } from '@/lib/verification';
import { checkVerificationFile } from '@/lib/verification-files';
import { getTierFromNetWorth } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const reviewer = await currentUser('admin');
    const data = reviewSchema.parse(await req.json());
    const application = await prisma.application.findUnique({ where: { id: data.applicationId } });
    if (!application) throw new ApiError('Application not found', 404);
    if (application.userId === reviewer.id) throw new ApiError('You cannot review your own application', 403);
    if (data.action === 'approve') {
      if (!data.identityChecked || !data.wealthChecked || !data.authenticityChecked) throw new ApiError('Complete the identity, net-worth, and authenticity checks before approval');
      if (!application.attestedAt || (application.declaredNetWorthUsd ?? 0) < 1_000_000 || !application.passportPath || !application.bankDocPath) throw new ApiError('Applicant must submit the required declaration and evidence first');
      const age = Date.now() - Date.parse(application.valuationDate ?? '');
      if (!Number.isFinite(age) || age < 0 || age > 90 * 86400000) throw new ApiError('Request a current valuation dated within 90 days');
      await Promise.all([checkVerificationFile(application.userId, application.passportPath), checkVerificationFile(application.userId, application.bankDocPath)]);
    }
    const status = data.action === 'approve' ? 'approved' : data.action === 'request_info' ? 'needs_info' : 'rejected';
    const verifiedUntil = data.action === 'approve' ? new Date(Date.now() + 365 * 86400000) : null;
    await prisma.$transaction(async tx => {
      const updated = await tx.application.updateMany({ where: { id: application.id, updatedAt: application.updatedAt }, data: {
        status, adminNote: data.note, reviewedAt: new Date(), reviewedBy: reviewer.id, verifiedUntil,
        identityChecked: data.action === 'approve' && data.identityChecked, wealthChecked: data.action === 'approve' && data.wealthChecked, authenticityChecked: data.action === 'approve' && data.authenticityChecked,
      } });
      if (updated.count !== 1) throw new ApiError('Application changed during review. Reload before deciding.', 409);
      await tx.user.update({ where: { id: application.userId }, data: { status, tier: data.action === 'approve' ? getTierFromNetWorth(wealthRange(application.declaredNetWorthUsd!)) : null } });
      await tx.adminAction.create({ data: { action: data.action, targetType: 'application', targetId: application.id, note: data.note, actorId: reviewer.id } });
    });
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
