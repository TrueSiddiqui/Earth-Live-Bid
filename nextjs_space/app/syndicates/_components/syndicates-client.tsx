"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ParticipationNotice } from '@/components/participation-notice';
import { Navbar } from '@/components/navbar';
import { formatCurrency, getTierColor, getTierLabel } from '@/lib/utils';
import { AnimatedCounter } from '@/components/animated-counter';
import { Users, Plus, Crown, Lock, ArrowRight, Loader2, X } from 'lucide-react';

interface Syndicate {
  id: string; name: string; description: string; targetCategory: string;
  minContribution: number; maxMembers: number; poolTotal: number;
  isLocked: boolean; memberCount: number; creatorName: string; creatorTier: string | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const categories = ['Oceans', 'Minerals', 'Atmosphere', 'Orbital Space', 'Forests', 'Freshwater', 'Seeds', 'Soils', 'Food Supply', 'Sunlight', 'Livestock', 'Pollinators', 'Wind', 'Geothermal', 'Marine Life', 'Medicinal Plants'];

export function SyndicatesClient({ syndicates, userId }: { syndicates: Syndicate[]; userId: string }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetCategory, setTargetCategory] = useState('');
  const [minContribution, setMinContribution] = useState('');
  const [maxMembers, setMaxMembers] = useState('20');

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/syndicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, targetCategory, minContribution: parseFloat(minContribution), maxMembers: parseInt(maxMembers) }),
      });
      if (res.ok) {
        setShowCreate(false);
        router.refresh();
      } else { const data = await res.json(); setError(data.error ?? 'Could not create syndicate'); }
    } catch (error) { console.error(error); setError('Request failed. Please try again.'); } finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 bg-[#FFFFFF] border border-[#A67C00]/10 rounded-lg text-[#2E3A46] placeholder-[#2E3A46]/20 focus:border-[#A67C00]/40 focus:outline-none transition-colors";

  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-[1200px] mx-auto">
        <motion.div initial="hidden" animate="visible" className="flex items-center justify-between mb-10">
          <div>
            <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-[#A67C00]" />
              <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#2E3A46]">Syndicates</h1>
            </motion.div>
            <motion.p variants={fadeUp} custom={1} className="text-[#2E3A46]/50">Coordinate declared pledges with verified members. Pledges are not funds held by this platform.</motion.p>
          </div>
          <motion.button
            variants={fadeUp}
            custom={2}
            onClick={() => setShowCreate(true)}
            className="px-5 py-2 bg-[#A67C00] text-[#FFFFFF] rounded-lg font-semibold text-sm hover:bg-[#A67C00]/90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Syndicate
          </motion.button>
        </motion.div>

        <ParticipationNotice />
        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="w-full max-w-lg p-8 rounded-xl bg-[#FFFFFF] border border-[#A67C00]/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#2E3A46]">Create Syndicate</h2>
                <button onClick={() => setShowCreate(false)} className="text-[#2E3A46]/40 hover:text-[#2E3A46]"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <input value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Syndicate Name" />
                <textarea value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} min-h-[80px]`} placeholder="Description" />
                <select value={targetCategory} onChange={e => setTargetCategory(e.target.value)} className={inputClass}>
                  <option value="">Target Asset Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" value={minContribution} onChange={e => setMinContribution(e.target.value)} className={inputClass} placeholder="Min Contribution (USD)" />
                  <input type="number" value={maxMembers} onChange={e => setMaxMembers(e.target.value)} className={inputClass} placeholder="Max Members" />
                </div>
                {error && <p role="alert" className="text-red-700">{error}</p>}
                <button onClick={handleCreate} disabled={loading || !name || !targetCategory} className="w-full py-3 bg-[#A67C00] text-[#FFFFFF] rounded-lg font-semibold disabled:opacity-30 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Syndicate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Syndicate list */}
        <motion.div initial="hidden" animate="visible" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(syndicates ?? []).map((syn: Syndicate, i: number) => (
            <motion.div key={syn?.id ?? i} variants={fadeUp} custom={i} className="p-6 rounded-xl bg-[#FFFFFF] border border-[#A67C00]/10 hover:border-[#A67C00]/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#A67C00] text-xs font-medium uppercase tracking-wider">{syn?.targetCategory ?? ''}</span>
                {syn?.isLocked && <Lock className="w-4 h-4 text-[#2E3A46]/40" />}
              </div>
              <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2E3A46] mb-2">{syn?.name ?? ''}</h3>
              <p className="text-[#2E3A46]/40 text-sm mb-4 line-clamp-2">{syn?.description ?? ''}</p>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[#2E3A46]/40 text-xs">Declared Pledges</p>
                  <p className="text-[#A67C00] font-bold">
                    {formatCurrency(syn?.poolTotal ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-[#2E3A46]/40 text-xs">Members</p>
                  <p className="text-[#2E3A46] font-bold">{syn?.memberCount ?? 0}/{syn?.maxMembers ?? 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                {syn?.creatorTier && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getTierColor(syn.creatorTier)}`}>
                    <Crown className="w-2.5 h-2.5" /> {getTierLabel(syn.creatorTier)}
                  </span>
                )}
                <span className="text-[#2E3A46]/40 text-xs">Led by {syn?.creatorName ?? 'Unknown'}</span>
              </div>
              <Link href={`/syndicates/${syn?.id}`} className="w-full py-2 bg-[#A67C00]/10 text-[#A67C00] rounded-lg text-sm font-semibold hover:bg-[#A67C00]/20 transition-all flex items-center justify-center gap-2">
                View Details <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
