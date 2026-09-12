export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/access';
import { apiError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { getFileUrl } from '@/lib/s3';
export async function GET(_req: Request, { params }: { params: Promise<{ path: string }> }) {
  try {
    const reviewer = await currentUser('admin');
    const { path } = await params;
    const application = await prisma.application.findFirst({ where: { OR: [{ passportPath: path, passportPublic: false }, { bankDocPath: path, bankDocPublic: false }] } });
    if (!application) throw new ApiError('Verification document not found', 404);
    const url = await getFileUrl(path, 'application/octet-stream', false);
    await prisma.adminAction.create({ data: { action: 'document_download', actorId: reviewer.id, targetType: 'application', targetId: application.id, note: application.passportPath === path ? 'Identity document' : 'Wealth document' } });
    return NextResponse.redirect(url, { headers: { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } });
  } catch (error) { return apiError(error); }
}
