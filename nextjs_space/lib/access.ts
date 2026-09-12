import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isVerified } from './verification';
import { ApiError } from './api-error';
export async function currentUser(mode: 'applicant' | 'member' | 'admin' = 'applicant') {
  const session = await auth();
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) throw new ApiError('Sign in required', 401);
  const user = await prisma.user.findUnique({ where: { id }, include: { application: true } });
  if (!user) throw new ApiError('Sign in required', 401);
  if (mode === 'admin' && user.role !== 'admin') throw new ApiError('Administrator access required', 403);
  if (mode === 'member' && (user.status !== 'approved' || !isVerified(user.application))) throw new ApiError('Current identity and wealth verification required', 403);
  return user;
}
