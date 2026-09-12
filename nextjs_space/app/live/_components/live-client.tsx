"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ParticipationNotice } from '@/components/participation-notice';
import { Navbar } from '@/components/navbar';
import { formatCurrency } from '@/lib/utils';
import { AnimatedCounter } from '@/components/animated-counter';
import { Radio, Gavel, Users, Globe, Infinity as InfinityIcon, ArrowRight, Crown } from 'lucide-react';

interface LiveAuction {
  id: string;
  assetName: string;
  category: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  bidCount: number;
  leader: string | null;
}

const COLORS = [
  {
    name: 'Moonlight',
    hex: '#7C8A9B',
    swatch: 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #C7D0DA 35%, #7C8A9B 100%)',
    heading: 'The Light of the Watchers',
    body:
      'A silver moonlight glow washes over everything. It represents the whole world watching in the quiet of the night — the witnesses, the awake, those who refuse to look away while the Earth is bargained over.',
  },
  {
    name: 'Gold — Dome of the Rock',
    hex: '#A67C00',
    swatch: 'linear-gradient(135deg, #E3C766 0%, #C9A227 45%, #A67C00 100%)',
    heading: 'The Gold of Al-Quds',
    body:
      'The radiant gold of the Dome of the Rock in Jerusalem (Al-Quds). It crowns our headlines, our tiers and the Earth\'s equator — a reminder of the sacred wealth that must never be surrendered to the oppressors.',
  },
  {
    name: 'Green — Masjid an-Nabawi',
    hex: '#0B6E4F',
    swatch: 'linear-gradient(135deg, #14926B 0%, #0B6E4F 100%)',
    heading: 'The Green Dome of Madinah',
    body:
      'The living green of the Green Dome above Masjid an-Nabawi. It colours the continents of our globe and the highest Titan tier — the color of life, of the Earth still breathing, of hope that endures.',
  },
  {
    name: 'Pure White',
    hex: '#FFFFFF',
    swatch: 'linear-gradient(135deg, #FFFFFF 0%, #F5F8F6 100%)',
    heading: 'The Unstained Canvas',
    body:
      'Every page rests on pure white — clarity, truth and transparency. Nothing hidden in the dark. The whole world can see exactly what is happening, in full light.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6 } }),
};

export function LiveClient({
  auctions,
  totalPool,
  totalBids,
}: {
  auctions: LiveAuction[];
  totalPool: number;
  totalBids: number;
}) {
  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-14 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(199,210,218,0.55) 0%, rgba(255,255,255,0) 70%)' }} />
        </div>
        <div className="relative max-w-[1000px] mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B6E4F]/10 border border-[#0B6E4F]/20 mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0B6E4F] opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0B6E4F]" />
            </span>
            <span className="text-[#0B6E4F] text-sm font-semibold tracking-wide flex items-center gap-1.5">
              <Radio className="w-4 h-4" /> LIVE · OPEN TO THE WHOLE WORLD
            </span>
          </motion.div>

          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5">
            <span className="gold-text">Watch The Bidding.</span>
            <br />
            <span className="text-[#2E3A46]">No Login. No Curtain.</span>
          </motion.h1>

          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-[#2E3A46]/60 text-lg max-w-[640px] mx-auto mb-8">
            The whole world can watch the live results as syndicates bid on Earth&apos;s
            resources. And understand the meaning woven into every color you see.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#A67C00]/10 border border-[#A67C00]/25 text-[#A67C00] font-semibold">
            <InfinityIcon className="w-5 h-5" /> The bidding does not end — until further notice.
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4"><ParticipationNotice /></div>
      {/* Live stats */}
      <section className="px-4 pb-4">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Assets On The Block', value: auctions?.length ?? 0, prefix: '', icon: Globe },
            { label: 'Total Bids Cast', value: totalBids ?? 0, prefix: '', icon: Gavel },
            { label: 'Combined Leading Bids', value: totalPool ?? 0, prefix: '$', icon: Crown, money: true },
          ].map((s, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              className="rounded-2xl bg-[#F5F8F6] border border-[#A67C00]/10 p-6 text-center">
              <s.icon className="w-6 h-6 text-[#A67C00] mx-auto mb-3" />
              <div className="font-['Playfair_Display'] text-3xl font-bold text-[#2E3A46]">
                {s.money ? (
                  formatCurrency(s.value)
                ) : (
                  <AnimatedCounter end={s.value} />
                )}
              </div>
              <p className="text-[#7C8A9B] text-sm mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live bidding results */}
      <section className="px-4 py-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Radio className="w-7 h-7 text-[#0B6E4F]" />
            <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#2E3A46]">Live Bidding Results</h2>
          </div>

          {(!auctions || auctions.length === 0) ? (
            <div className="rounded-2xl bg-[#F5F8F6] border border-[#A67C00]/10 p-12 text-center">
              <Globe className="w-10 h-10 text-[#7C8A9B] mx-auto mb-4" />
              <p className="text-[#2E3A46]/60">The floor is being prepared. The first assets go live shortly — the bidding will not close until further notice.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((a: LiveAuction, i: number) => (
                <motion.div key={a?.id ?? i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                  className="rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#A67C00]/10 hover:border-[#A67C00]/30 transition-all group">
                  <div className="relative aspect-video bg-[#EAEEF3]">
                    {a?.imageUrl && (
                      <Image src={a.imageUrl} alt={a?.assetName ?? 'Auction'} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-[#FFFFFF]/85 rounded-full text-xs text-[#A67C00] font-medium backdrop-blur-sm">{a?.category ?? ''}</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-[#0B6E4F] rounded-full text-xs text-white font-semibold backdrop-blur-sm flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                        </span>
                        LIVE
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2E3A46] mb-3">{a?.assetName ?? ''}</h3>
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-[#7C8A9B] text-xs uppercase tracking-wider">Leading Bid</p>
                        <p className="text-[#A67C00] font-bold text-2xl font-['Playfair_Display']">{formatCurrency(a?.currentBid ?? 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#7C8A9B] text-xs uppercase tracking-wider">Bids</p>
                        <p className="text-[#2E3A46] font-bold flex items-center justify-end gap-1"><Users className="w-3.5 h-3.5" /> {a?.bidCount ?? 0}</p>
                      </div>
                    </div>
                    {a?.leader ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0B6E4F]/8 border border-[#0B6E4F]/15">
                        <Crown className="w-4 h-4 text-[#0B6E4F]" />
                        <span className="text-[#0B6E4F] text-sm font-medium truncate">Leading: {a.leader}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F8F6] border border-[#A67C00]/10">
                        <Gavel className="w-4 h-4 text-[#7C8A9B]" />
                        <span className="text-[#7C8A9B] text-sm">Awaiting the first bid</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <p className="text-center text-[#7C8A9B] text-sm mt-8">
            Spectating is open to all. To place a bid, you must be an approved member of a syndicate.
          </p>
        </div>
      </section>

      {/* Color scheme meaning */}
      <section className="px-4 py-16 bg-[#F5F8F6] border-y border-[#A67C00]/10">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#2E3A46] mb-3">The Meaning Of Our Colors</h2>
            <p className="text-[#2E3A46]/60 max-w-[620px] mx-auto">Every hue on this platform is chosen with intention. This is the language of our light.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {COLORS.map((c, i) => (
              <motion.div key={c.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="rounded-2xl bg-[#FFFFFF] border border-[#A67C00]/10 p-6 flex gap-5">
                <div className="shrink-0">
                  <div className="w-16 h-16 rounded-2xl shadow-inner border border-black/5" style={{ background: c.swatch }} />
                  <p className="text-center text-[10px] tracking-widest text-[#7C8A9B] mt-2 font-mono">{c.hex}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#A67C00] font-semibold mb-1">{c.name}</p>
                  <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#2E3A46] mb-2">{c.heading}</h3>
                  <p className="text-[#2E3A46]/60 text-sm leading-relaxed">{c.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16">
        <div className="max-w-[720px] mx-auto text-center">
          <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#2E3A46] mb-4">Seen enough? Take your place.</h2>
          <p className="text-[#2E3A46]/60 mb-8">Watching is for the world. Bidding is for the members. Apply to join a syndicate and shape the outcome.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup" className="px-7 py-3 bg-[#A67C00] text-white rounded-lg font-semibold hover:bg-[#A67C00]/90 transition-all flex items-center gap-2">
              Apply Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/" className="px-7 py-3 bg-[#0B6E4F]/10 text-[#0B6E4F] rounded-lg font-semibold hover:bg-[#0B6E4F]/20 transition-all">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
