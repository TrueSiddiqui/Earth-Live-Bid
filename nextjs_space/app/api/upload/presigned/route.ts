export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { currentUser } from '@/lib/access';
import { apiError, ApiError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';
import { generatePresignedUploadUrl } from '@/lib/s3';
import { MAX_DOCUMENT_SIZE, DOCUMENT_TYPES } from '@/lib/verification';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!rateLimit(`upload:${user.id}`, 12, 60000)) throw new ApiError('Too many upload requests. Please wait a minute.', 429);
    const data = z.object({ fileName: z.string().min(1).max(200), contentType: z.string(), size: z.number().int().positive().max(MAX_DOCUMENT_SIZE), isPublic: z.literal(false).optional() }).parse(await req.json());
    if (!DOCUMENT_TYPES.includes(data.contentType)) throw new ApiError('Use PDF, JPEG, or PNG documents up to 10 MB');
    const ext = data.contentType === 'application/pdf' ? 'pdf' : data.contentType === 'image/png' ? 'png' : 'jpg';
    const result = await generatePresignedUploadUrl(`${randomUUID()}.${ext}`, data.contentType, false, data.size);
    await prisma.verificationUpload.create({ data: { userId: user.id, cloud_storage_path: result.cloud_storage_path, isPublic: false, contentType: data.contentType, size: data.size } });
    return NextResponse.json({ ...result, isPublic: false }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiError(error); }
}
