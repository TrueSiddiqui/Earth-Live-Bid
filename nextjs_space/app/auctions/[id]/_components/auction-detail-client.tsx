"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ParticipationNotice } from '@/components/participation-notice';
import { Navbar } from '@/components/navbar';
import { formatCurrency, getTierColor, getTierLabel } from '@/lib/utils';
import { Gavel, Clock, Users, DollarSign, Crown, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
  auction: {
    id: string; assetName: string; category: string; description: string;
    imageUrl: string; reservePrice: number; currentBid: number;
    bidCount: number; endsAt: string; tierRequired: string | null; status: string;
  };
  recentBids: { id: string; amount: number; bidderName: string; bidderTier: string | null; createdAt: string }[];
  userTier: string | null;
  userSyndicates: { id: string; name: string; poolTotal: number }[];
}


export function AuctionDetailClient({ auction, recentBids, userTier, userSyndicates }: Props) {
  const router = useRouter();
  const [bidAmount, setBidAmount] = useState('');
  const [bidType, setBidType] = useState<'personal' | 'syndicate'>('personal');
  const [selectedSyndicate, setSelectedSyndicate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleBid = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId: auction?.id,
          amount: parseFloat(bidAmount),
          syndicateId: bidType === 'syndicate' ? selectedSyndicate : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Bid failed');
      } else {
        setSuccess('Bid placed successfully!');
        setBidAmount('');
        router.refresh();
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-[1200px] mx-auto">
        <Link href="/auctions" className="inline-flex items-center gap-2 text-[#A67C00] text-sm mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Auctions
        </Link>

        <ParticipationNotice />
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden">
              <div className="relative aspect-video bg-[#EAEEF3] rounded-xl overflow-hidden">
                {auction?.imageUrl && (
                  <Image src={auction.imageUrl} alt={auction?.assetName ?? 'Auction'} fill className="object-cover" />
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6">
              <span className="text-[#A67C00] text-sm font-medium">{auction?.category ?? ''}</span>
              <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#2E3A46] mt-2 mb-4">{auction?.assetName ?? ''}</h1>
              <p className="text-[#2E3A46]/60 leading-relaxed">{auction?.description ?? ''}</p>
            </motion.div>

            {/* Recent bids */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
              <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#2E3A46] mb-4">Recent Bids</h2>
              <div className="space-y-2">
                {(recentBids ?? []).map((bid: any, i: number) => (
                  <div key={bid?.id ?? i} className="flex items-center justify-between p-3 rounded-lg bg-[#FFFFFF] border border-[#A67C00]/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#A67C00]/10 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-[#A67C00]" />
                      </div>
                      <div>
                        <p className="text-[#2E3A46] text-sm font-medium">{bid?.bidderName ?? 'Anonymous'}</p>
                        {bid?.bidderTier && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getTierColor(bid.bidderTier)}`}>
                            <Crown className="w-2.5 h-2.5" /> {getTierLabel(bid.bidderTier)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[#A67C00] font-bold">{formatCurrency(bid?.amount ?? 0)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bid panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <div className="sticky top-24 p-6 rounded-xl bg-[#FFFFFF] border border-[#A67C00]/10 gold-glow">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 rounded-lg bg-[#FFFFFF]">
                  <p className="text-[#2E3A46]/40 text-xs uppercase">Current Bid</p>
                  <p className="text-[#A67C00] font-bold text-xl">{formatCurrency(auction?.currentBid ?? 0)}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#FFFFFF]">
                  <p className="text-[#2E3A46]/40 text-xs uppercase">Reserve</p>
                  <p className="text-[#2E3A46] font-bold text-xl">{formatCurrency(auction?.reservePrice ?? 0)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-[#2E3A46]/60 text-sm">
                  <Users className="w-4 h-4" /> {auction?.bidCount ?? 0} bids
                </div>
                <div className="flex items-center gap-2 text-[#2E3A46]/60 text-sm">
                  <Clock className="w-4 h-4" /> <span>{auction.status === 'active' ? 'Open until further notice' : 'Closed'}</span>
                </div>
              </div>

              {auction?.status === 'active' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBidType('personal')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${bidType === 'personal' ? 'bg-[#A67C00] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#2E3A46]/50 border border-[#A67C00]/10'}`}
                    >Personal</button>
                    <button
                      onClick={() => setBidType('syndicate')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${bidType === 'syndicate' ? 'bg-[#A67C00] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#2E3A46]/50 border border-[#A67C00]/10'}`}
                    >Syndicate</button>
                  </div>

                  {bidType === 'syndicate' && (
                    <select
                      value={selectedSyndicate}
                      onChange={e => setSelectedSyndicate(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#A67C00]/10 rounded-lg text-[#2E3A46] focus:border-[#A67C00]/40 focus:outline-none"
                    >
                      <option value="">Select syndicate</option>
                      {(userSyndicates ?? []).map((s: any) => (
                        <option key={s?.id} value={s?.id}>{s?.name ?? ''} ({formatCurrency(s?.poolTotal ?? 0)})</option>
                      ))}
                    </select>
                  )}

                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A67C00]" />
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                      placeholder="Enter bid amount"
                      className="w-full pl-10 pr-4 py-3 bg-[#FFFFFF] border border-[#A67C00]/10 rounded-lg text-[#2E3A46] placeholder-[#2E3A46]/20 focus:border-[#A67C00]/40 focus:outline-none"
                    />
                  </div>

                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  {success && <p className="text-green-400 text-sm">{success}</p>}

                  <button
                    onClick={handleBid}
                    disabled={loading || !bidAmount || (bidType === 'syndicate' && !selectedSyndicate)}
                    className="w-full py-3 bg-[#A67C00] text-[#FFFFFF] rounded-lg font-semibold hover:bg-[#A67C00]/90 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Gavel className="w-5 h-5" /> Place Bid</>}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
