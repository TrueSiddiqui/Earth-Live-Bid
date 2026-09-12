"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ParticipationNotice } from '@/components/participation-notice';
import { Navbar } from '@/components/navbar';
import { formatCurrency, getTierLabel } from '@/lib/utils';
import { Gavel, Clock, Users, Lock, ArrowRight } from 'lucide-react';

interface Auction {
  id: string; assetName: string; category: string; description: string;
  imageUrl: string; reservePrice: number; currentBid: number;
  bidCount: number; endsAt: string; tierRequired: string | null;
}


const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

export function AuctionsClient({ auctions, userTier }: { auctions: Auction[]; userTier: string | null }) {
  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-[1200px] mx-auto">
        <ParticipationNotice />
        <motion.div initial="hidden" animate="visible" className="mb-10">
          <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 mb-2">
            <Gavel className="w-8 h-8 text-[#A67C00]" />
            <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#2E3A46]">Earth Asset Auctions</h1>
          </motion.div>
          <motion.p variants={fadeUp} custom={1} className="text-[#2E3A46]/50">Bid on the world's most extraordinary resource assets.</motion.p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" className="grid md:grid-cols-2 gap-6">
          {(auctions ?? []).map((auction: Auction, i: number) => (
            <motion.div key={auction?.id ?? i} variants={fadeUp} custom={i} className="rounded-xl overflow-hidden bg-[#FFFFFF] border border-[#A67C00]/10 hover:border-[#A67C00]/30 transition-all group">
              <div className="relative aspect-video bg-[#EAEEF3]">
                {auction?.imageUrl && (
                  <Image src={auction.imageUrl} alt={auction?.assetName ?? 'Auction'} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-3 py-1 bg-[#FFFFFF]/80 rounded-full text-xs text-[#A67C00] font-medium backdrop-blur-sm">{auction?.category ?? ''}</span>
                  {auction?.tierRequired && (
                    <span className="px-3 py-1 bg-[#A67C00]/20 rounded-full text-xs text-[#A67C00] font-medium backdrop-blur-sm flex items-center gap-1">
                      <Lock className="w-3 h-3" /> {getTierLabel(auction.tierRequired)}+
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2E3A46] mb-2">{auction?.assetName ?? ''}</h3>
                <p className="text-[#2E3A46]/40 text-sm mb-4 line-clamp-2">{auction?.description ?? ''}</p>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-[#2E3A46]/40 text-xs uppercase tracking-wider">Current Bid</p>
                    <p className="text-[#A67C00] font-bold">{formatCurrency(auction?.currentBid ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-[#2E3A46]/40 text-xs uppercase tracking-wider">Bids</p>
                    <p className="text-[#2E3A46] font-bold flex items-center gap-1"><Users className="w-3 h-3" /> {auction?.bidCount ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-[#2E3A46]/40 text-xs uppercase tracking-wider">Bidding Status</p>
                    <p className="text-[#2E3A46] font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> <span>{'Open until further notice'}</span></p>
                  </div>
                </div>
                <Link href={`/auctions/${auction?.id}`} className="w-full py-2.5 bg-[#A67C00]/10 text-[#A67C00] rounded-lg font-semibold text-sm hover:bg-[#A67C00]/20 transition-all flex items-center justify-center gap-2">
                  View & Bid <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
