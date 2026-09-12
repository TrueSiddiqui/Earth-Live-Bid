"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { formatCurrency, getTierColor, getTierLabel } from '@/lib/utils';
import {
  LayoutDashboard, FileText, Users, Gavel, Crown,
  CheckCircle, Clock, XCircle, ArrowRight, Plus
} from 'lucide-react';

interface Props {
  user: { id: string; fullName: string; email: string; role: string; tier: string | null; status: string };
  application: { id: string; status: string; verifiedUntil: string | null; tier: string; adminNote: string | null; createdAt: string } | null;
  memberships: { id: string; pledgeAmount: number; syndicate: { id: string; name: string; poolTotal: number; targetCategory: string } }[];
  syndicatesCreated: { id: string; name: string; poolTotal: number; memberCount: number; targetCategory: string }[];
  bids: { id: string; amount: number; createdAt: string; auction: { id: string; assetName: string; status: string; currentBid: number } }[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const statusIcon: Record<string, any> = {
  pending: <Clock className="w-5 h-5 text-yellow-500" />,
  approved: <CheckCircle className="w-5 h-5 text-green-500" />,
  rejected: <XCircle className="w-5 h-5 text-red-500" />,
};

export function DashboardClient({ user, application, memberships, syndicatesCreated, bids }: Props) {
  const isApproved = user?.status === 'approved';

  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="mb-10">
          <motion.div variants={fadeUp} custom={0} className="flex items-center gap-4 mb-2">
            <LayoutDashboard className="w-8 h-8 text-[#A67C00]" />
            <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#2E3A46]">Welcome, {user?.fullName ?? 'Member'}</h1>
          </motion.div>
          <motion.div variants={fadeUp} custom={1} className="flex items-center gap-3">
            {user?.tier && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getTierColor(user.tier)}`}>
                <Crown className="w-3 h-3" /> {getTierLabel(user.tier)}
              </span>
            )}
            <span suppressHydrationWarning className="text-[#2E3A46]/40 text-sm">{user?.email ?? ''}</span>
          </motion.div>
        </motion.div>

        {/* Application Status */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="mb-8">
          <div className="p-6 rounded-xl bg-[#FFFFFF] border border-[#A67C00]/10">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-[#A67C00]" />
              <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#2E3A46]">Application Status</h2>
            </div>
            {!isApproved && <p className="text-[#2E3A46] text-sm mb-4">Applicant access only. Auction and syndicate participation remain restricted until identity and wealth verification is current.</p>}
            {application?.verifiedUntil && <p className="text-sm text-[#0B6E4F] mb-3">Verification expiry: {application.verifiedUntil.slice(0, 10)}</p>}
            {application && ['needs_info', 'rejected', 'renewal_required'].includes(application.status) && <Link href="/apply" className="inline-block text-[#0B6E4F] underline mb-3">Update evidence and resubmit application</Link>}
            {application ? (
              <div className="flex items-center gap-3">
                {statusIcon[application?.status ?? 'pending']}
                <span className="text-[#2E3A46] font-medium capitalize">{application?.status.replace(/_/g, ' ') ?? 'Unknown'}</span>
                {application?.adminNote && (
                  <span className="text-[#2E3A46]/50 text-sm ml-4">— {application.adminNote}</span>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-[#2E3A46]/50">No application submitted yet.</p>
                <Link href="/apply" className="px-5 py-2 bg-[#A67C00] text-[#FFFFFF] rounded-lg font-semibold text-sm hover:bg-[#A67C00]/90 transition-all flex items-center gap-2">
                  Apply Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Grid */}
        {isApproved && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* My Syndicates */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="p-6 rounded-xl bg-[#FFFFFF] border border-[#A67C00]/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#A67C00]" />
                  <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#2E3A46]">My Syndicates</h2>
                </div>
                <Link href="/syndicates" className="text-[#A67C00] text-sm hover:underline">View All</Link>
              </div>
              {(memberships?.length ?? 0) === 0 && (syndicatesCreated?.length ?? 0) === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#2E3A46]/50 mb-4">You haven't joined any syndicates yet.</p>
                  <Link href="/syndicates" className="px-4 py-2 bg-[#A67C00]/10 text-[#A67C00] rounded-lg text-sm font-semibold hover:bg-[#A67C00]/20 transition-all inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Browse Syndicates
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {syndicatesCreated?.map((s: any) => (
                    <Link key={s?.id} href={`/syndicates/${s?.id}`} className="block p-3 rounded-lg bg-[#FFFFFF] border border-[#A67C00]/5 hover:border-[#A67C00]/20 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="text-[#2E3A46] font-medium text-sm">{s?.name ?? ''}</span>
                        <span className="text-[#A67C00] text-xs">Creator</span>
                      </div>
                      <p className="text-[#2E3A46]/40 text-xs mt-1">{formatCurrency(s?.poolTotal ?? 0)} pledged · {s?.memberCount ?? 0} members</p>
                    </Link>
                  ))}
                  {memberships?.map((m: any) => (
                    <Link key={m?.id} href={`/syndicates/${m?.syndicate?.id}`} className="block p-3 rounded-lg bg-[#FFFFFF] border border-[#A67C00]/5 hover:border-[#A67C00]/20 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="text-[#2E3A46] font-medium text-sm">{m?.syndicate?.name ?? ''}</span>
                        <span className="text-[#2E3A46]/40 text-xs">{formatCurrency(m?.pledgeAmount ?? 0)} pledged</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>

            {/* My Bids */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="p-6 rounded-xl bg-[#FFFFFF] border border-[#A67C00]/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Gavel className="w-5 h-5 text-[#A67C00]" />
                  <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#2E3A46]">My Bids</h2>
                </div>
                <Link href="/auctions" className="text-[#A67C00] text-sm hover:underline">View Auctions</Link>
              </div>
              {(bids?.length ?? 0) === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#2E3A46]/50 mb-4">No bids placed yet.</p>
                  <Link href="/auctions" className="px-4 py-2 bg-[#A67C00]/10 text-[#A67C00] rounded-lg text-sm font-semibold hover:bg-[#A67C00]/20 transition-all inline-flex items-center gap-2">
                    <Gavel className="w-4 h-4" /> Browse Auctions
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {bids?.map((b: any) => (
                    <Link key={b?.id} href={`/auctions/${b?.auction?.id}`} className="block p-3 rounded-lg bg-[#FFFFFF] border border-[#A67C00]/5 hover:border-[#A67C00]/20 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="text-[#2E3A46] font-medium text-sm">{b?.auction?.assetName ?? ''}</span>
                        <span className={`text-xs font-bold ${b?.amount >= (b?.auction?.currentBid ?? 0) ? 'text-green-400' : 'text-[#2E3A46]/40'}`}>
                          {formatCurrency(b?.amount ?? 0)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}
