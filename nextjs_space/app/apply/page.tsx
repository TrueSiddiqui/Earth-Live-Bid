import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { isVerified } from '@/lib/verification';
import { ApplyClient } from './_components/apply-client';

export const dynamic = 'force-dynamic';

export default async function ApplyPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const userId = (session.user as any)?.id;
  const existing = await prisma.application.findUnique({ where: { userId } });
  if (existing && (existing.status === 'pending' || isVerified(existing))) redirect('/dashboard');
  return <ApplyClient />;
}
