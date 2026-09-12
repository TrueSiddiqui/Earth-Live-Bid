import { HeadObjectCommand, GetObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client, getBucketConfig } from './aws-config';
import { prisma } from './prisma';
import { ApiError } from './api-error';
import { MAX_DOCUMENT_SIZE } from './verification';
import { randomUUID } from 'crypto';

// Submitted evidence gets a new server-only path; an unexpired upload URL cannot replace it.
export async function sealVerificationFile(userId: string, source: string) {
  await checkVerificationFile(userId, source);
  const record = await prisma.verificationUpload.findUniqueOrThrow({ where: { cloud_storage_path: source } });
  const { bucketName, folderPrefix } = getBucketConfig();
  const cloud_storage_path = `${folderPrefix}uploads/${Date.now()}-sealed-${randomUUID()}`;
  await createS3Client().send(new CopyObjectCommand({ Bucket: bucketName, Key: cloud_storage_path, CopySource: `${bucketName}/${source.split('/').map(encodeURIComponent).join('/')}` }));
  await prisma.verificationUpload.create({ data: { userId, cloud_storage_path, isPublic: false, size: record.size, contentType: record.contentType } });
  await checkVerificationFile(userId, cloud_storage_path);
  return cloud_storage_path;
}

export async function checkVerificationFile(userId: string, cloud_storage_path: string) {
  const record = await prisma.verificationUpload.findUnique({ where: { cloud_storage_path } });
  if (!record || record.userId !== userId || record.isPublic) throw new ApiError('Document must be your own private verification upload');
  const s3 = createS3Client();
  const params = { Bucket: getBucketConfig().bucketName, Key: cloud_storage_path };
  try {
    const head = await s3.send(new HeadObjectCommand(params));
    if (head.ContentLength !== record.size || record.size > MAX_DOCUMENT_SIZE || head.ContentType !== record.contentType) throw new ApiError('Uploaded document does not match its declared size or type');
    const response = await s3.send(new GetObjectCommand({ ...params, Range: 'bytes=0-7' }));
    const bytes = Buffer.from(await response.Body!.transformToByteArray());
    const valid = record.contentType === 'application/pdf' ? bytes.subarray(0, 5).toString() === '%PDF-' :
      record.contentType === 'image/png' ? bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a' : bytes.subarray(0, 3).toString('hex') === 'ffd8ff';
    if (!valid) throw new ApiError('Document content must be a PDF, JPEG, or PNG');
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Document validation failed', (error as Error).name);
    throw new ApiError('Document upload could not be confirmed. Upload again before submitting.');
  }
}
