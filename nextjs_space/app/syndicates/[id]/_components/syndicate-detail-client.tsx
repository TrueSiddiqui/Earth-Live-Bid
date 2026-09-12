"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ParticipationNotice } from '@/components/participation-notice';
import { Navbar } from '@/components/navbar';
import { formatCurrency, getTierColor, getTierLabel } from '@/lib/utils';
import { AnimatedCounter } from '@/components/animated-counter';
import { Users, Crown, DollarSign, Lock, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Props {
  syndicate: {
    id: string; name: string; description: string; targetCategory: string;
    minContribution: number; maxMembers: number; poolTotal: number;
    isLocked: boolean; creatorName: string; creatorTier: string | null;
  };
  members: { id: string; fullName: string; tier: string | null; pledgeAmount: number }[];
  isMember: boolean;
  isCreator: boolean;
}

export function SyndicateDetailClient({ syndicate, members, isMember, isCreator }: Props) {
  const router = useRouter();
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockLoading, setLockLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/syndicates/${syndicate?.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pledgeAmount: parseFloat(pledgeAmount) }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data?.error ?? 'Failed to join');
      } else {
        router.refresh();
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async () => {
    setLockLoading(true);
    try {
      const response = await fetch(`/api/syndicates/${syndicate?.id}/lock`, { method: 'POST' });
      if (!response.ok) { const data = await response.json(); setError(data.error ?? 'Could not close pledges'); return; }
      router.refresh();
    } catch (error) { console.error(error); setError('Could not close pledges. Please try again.'); } finally { setLockLoading(false); }
  };

  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-[1200px] mx-auto">
        <Link href="/syndicates" className="inline-flex items-center gap-2 text-[#A67C00] text-sm mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Syndicates
        </Link>

        <ParticipationNotice />
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main info */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-[#A67C00] text-sm font-medium uppercase tracking-wider">{syndicate?.targetCategory ?? ''}</span>
              <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#2E3A46] mt-2 mb-4">{syndicate?.name ?? ''}</h1>
              <p className="text-[#2E3A46]/60 leading-relaxed mb-6">{syndicate?.description ?? ''}</p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#A67C00]/5">
                  <p className="text-[#2E3A46]/40 text-xs uppercase">Declared Pledges</p>
                  <p className="text-[#A67C00] font-bold text-2xl font-['Playfair_Display']">
                    {formatCurrency(syndicate?.poolTotal ?? 0)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#A67C00]/5">
                  <p className="text-[#2E3A46]/40 text-xs uppercase">Members</p>
                  <p className="text-[#2E3A46] font-bold text-2xl">{members?.length ?? 0}/{syndicate?.maxMembers ?? 0}</p>
                </div>
                <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#A67C00]/5">
                  <p className="text-[#2E3A46]/40 text-xs uppercase">Min Contribution</p>
                  <p className="text-[#2E3A46] font-bold text-2xl">{formatCurrency(syndicate?.minContribution ?? 0)}</p>
                </div>
              </div>
            </motion.div>

            {/* Members list */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#2E3A46] mb-4">Members</h2>
              <div className="space-y-2">
                {(members ?? []).map((m: any, i: number) => (
                  <div key={m?.id ?? i} className="flex items-center justify-between p-3 rounded-lg bg-[#FFFFFF] border border-[#A67C00]/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#A67C00]/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-[#A67C00]" />
                      </div>
                      <div>
                        <p className="text-[#2E3A46] text-sm font-medium">{m?.fullName ?? 'Member'}</p>
                        {m?.tier && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getTierColor(m.tier)}`}>
                            <Crown className="w-2.5 h-2.5" /> {getTierLabel(m.tier)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[#A67C00] font-bold text-sm">{formatCurrency(m?.pledgeAmount ?? 0)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Action panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="sticky top-24 p-6 rounded-xl bg-[#FFFFFF] border border-[#A67C00]/10">
              <div className="flex items-center gap-2 mb-4">
                {syndicate?.creatorTier && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getTierColor(syndicate.creatorTier)}`}>
                    <Crown className="w-2.5 h-2.5" /> {getTierLabel(syndicate.creatorTier)}
                  </span>
                )}
                <span className="text-[#2E3A46]/40 text-xs">Led by {syndicate?.creatorName ?? 'Unknown'}</span>
              </div>

              {error && <p role="alert" className="text-red-700 mb-3">{error}</p>}
              <p className="text-sm text-[#2E3A46] mb-4">The leader closes pledges and places syndicate bids. A pledge is not a payment or ownership allocation. Withdrawal, voting, distributions, and dispute terms require a separate agreement before any funds change hands.</p>
              {syndicate?.isLocked ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#A67C00]/5 text-[#A67C00] text-sm">
                  <Lock className="w-4 h-4" /> Pledges closed; leader may bid. No funds are held.
                </div>
              ) : (
                <>
                  {!isMember && (
                    <div className="space-y-4">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A67C00]" />
                        <input
                          type="number"
                          value={pledgeAmount}
                          onChange={e => setPledgeAmount(e.target.value)}
                          placeholder={`Min ${formatCurrency(syndicate?.minContribution ?? 0)}`}
                          className="w-full pl-10 pr-4 py-3 bg-[#FFFFFF] border border-[#A67C00]/10 rounded-lg text-[#2E3A46] placeholder-[#2E3A46]/20 focus:border-[#A67C00]/40 focus:outline-none"
                        />
                      </div>
                      {error && <p className="text-red-400 text-sm">{error}</p>}
                      <button
                        onClick={handleJoin}
                        disabled={loading || !pledgeAmount}
                        className="w-full py-3 bg-[#A67C00] text-[#FFFFFF] rounded-lg font-semibold disabled:opacity-30 flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join Syndicate'}
                      </button>
                    </div>
                  )}
                  {isMember && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/5 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" /> You are a member
                    </div>
                  )}
                  {isCreator && (
                    <button
                      onClick={handleLock}
                      disabled={lockLoading}
                      className="w-full py-3 bg-[#A67C00]/10 text-[#A67C00] rounded-lg font-semibold hover:bg-[#A67C00]/20 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      {lockLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Lock className="w-4 h-4" /> Close Pledges for Bidding</>}
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
