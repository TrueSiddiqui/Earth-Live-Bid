"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { formatCurrency, getTierLabel } from '@/lib/utils';
import {
  Shield, FileText, Users, Gavel, DollarSign, CheckCircle, XCircle,
  Clock, Eye, Loader2, Plus, X
} from 'lucide-react';

interface Application {
  id: string; legalName: string; nationality: string; dateOfBirth: string;
  countryResidence: string; netWorthRange: string; tier: string;
  sourceOfWealth: string; primaryAssetClass: string; bankName: string;
  bankCountry: string; swiftCode: string; status: string; adminNote: string;
  userId: string; userEmail: string; passportPath: string | null;
  bankDocPath: string | null; createdAt: string;
  declaredNetWorthUsd: number | null; valuationDate: string | null; valuationNotes: string | null;
  attestedAt: string | null; verifiedUntil: string | null; reviewedBy: string | null;
}

interface Props {
  applications: Application[];
  syndicates: { id: string; name: string; targetCategory: string; poolTotal: number; memberCount: number; isLocked: boolean }[];
  auctions: { id: string; assetName: string; category: string; reservePrice: number; currentBid: number; bidCount: number; endsAt: string; status: string; tierRequired: string | null }[];
  recentBids: { id: string; amount: number; bidderName: string; auctionName: string; createdAt: string }[];
}

type Tab = 'applications' | 'syndicates' | 'auctions' | 'bids';

export function AdminClient({ applications, syndicates, auctions, recentBids }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('applications');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [checks, setChecks] = useState({ identityChecked: false, wealthChecked: false, authenticityChecked: false });
  const [showCreateAuction, setShowCreateAuction] = useState(false);
  const [auctionForm, setAuctionForm] = useState<any>({ assetName: '', category: '', description: '', reservePrice: '', tierRequired: '', imageUrl: '' });
  const [auctionLoading, setAuctionLoading] = useState(false);
  const [auctionError, setAuctionError] = useState('');

  const pendingApps = (applications ?? []).filter((a: any) => a?.status === 'pending');

  const handleReview = async (action: 'approve' | 'reject' | 'request_info') => {
    if (!selectedApp) return;
    setReviewLoading(true);
    setReviewError('');
    try {
      const response = await fetch('/api/admin/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: selectedApp.id, action, note: reviewNote, ...checks }),
      });
      const result = await response.json();
      if (!response.ok) { setReviewError(result.error ?? 'Review failed'); return; }
      setSelectedApp(null);
      setReviewNote('');
      router.refresh();
    } catch (error) { console.error(error); setReviewError('Review failed. Please try again.'); } finally { setReviewLoading(false); }
  };

  const handleCreateAuction = async () => {
    setAuctionLoading(true);
    setAuctionError('');
    try {
      const response = await fetch('/api/admin/auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...auctionForm,
          reservePrice: parseFloat(auctionForm.reservePrice),
        }),
      });
      const result = await response.json();
      if (!response.ok) { setAuctionError(result.error ?? 'Creation failed'); return; }
      setShowCreateAuction(false);
      setAuctionForm({ assetName: '', category: '', description: '', reservePrice: '', tierRequired: '', imageUrl: '' });
      router.refresh();
    } catch (error) { console.error(error); setAuctionError('Creation failed. Try again.'); } finally { setAuctionLoading(false); }
  };

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: 'applications', label: 'Applications', icon: FileText, count: pendingApps.length },
    { key: 'syndicates', label: 'Syndicates', icon: Users },
    { key: 'auctions', label: 'Auctions', icon: Gavel },
    { key: 'bids', label: 'Live Bids', icon: DollarSign },
  ];

  const inputClass = "w-full px-4 py-3 bg-[#FFFFFF] border border-[#A67C00]/10 rounded-lg text-[#2E3A46] placeholder-[#2E3A46]/20 focus:border-[#A67C00]/40 focus:outline-none transition-colors";

  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-[#A67C00]" />
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#2E3A46]">Admin Portal</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  tab === t.key ? 'bg-[#A67C00] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#2E3A46]/50 hover:text-[#A67C00]'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
                {(t.count ?? 0) > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white">{t.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Applications Tab */}
        {tab === 'applications' && (
          <div className="space-y-3">
            {(applications ?? []).map((app: Application) => (
              <motion.div
                key={app?.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-[#FFFFFF] border border-[#A67C00]/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    app?.status === 'pending' ? 'bg-yellow-500' : app?.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-[#2E3A46] font-medium">{app?.legalName ?? ''}</p>
                    <p className="text-[#2E3A46]/40 text-sm"><span suppressHydrationWarning>{app?.userEmail ?? ''}</span> · {getTierLabel(app?.tier)} · {app?.netWorthRange ?? ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    app?.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                    app?.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>{app?.status ?? ''}</span>
                  <button
                    aria-label={`Review ${app.legalName}`}
                    onClick={() => { setSelectedApp(app); setReviewNote(''); setReviewError(''); setChecks({ identityChecked: false, wealthChecked: false, authenticityChecked: false }); }}
                    className="p-2 rounded-lg bg-[#A67C00]/10 text-[#A67C00] hover:bg-[#A67C00]/20"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Application detail modal */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl p-8 rounded-xl bg-[#FFFFFF] border border-[#A67C00]/10 my-8 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#2E3A46]">Application Review</h2>
                <button onClick={() => setSelectedApp(null)} className="text-[#2E3A46]/40 hover:text-[#2E3A46]"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-[#FFFFFF]">
                    <p className="text-[#A67C00] text-xs uppercase mb-1">Legal Name</p>
                    <p className="text-[#2E3A46]">{selectedApp?.legalName ?? ''}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FFFFFF]">
                    <p className="text-[#A67C00] text-xs uppercase mb-1">Nationality</p>
                    <p className="text-[#2E3A46]">{selectedApp?.nationality ?? ''}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FFFFFF]">
                    <p className="text-[#A67C00] text-xs uppercase mb-1">DOB</p>
                    <p className="text-[#2E3A46]">{selectedApp?.dateOfBirth ?? ''}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FFFFFF]">
                    <p className="text-[#A67C00] text-xs uppercase mb-1">Country</p>
                    <p className="text-[#2E3A46]">{selectedApp?.countryResidence ?? ''}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-[#FFFFFF]">
                    <p className="text-[#A67C00] text-xs uppercase mb-1">Net Worth</p>
                    <p className="text-[#2E3A46]">{selectedApp?.netWorthRange ?? ''}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FFFFFF]">
                    <p className="text-[#A67C00] text-xs uppercase mb-1">Tier</p>
                    <p className="text-[#2E3A46] font-bold">{getTierLabel(selectedApp?.tier)}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#FFFFFF]">
                  <p className="text-[#A67C00] text-xs uppercase mb-1">Source of Wealth</p>
                  <p className="text-[#2E3A46]">{selectedApp?.sourceOfWealth ?? ''}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-[#FFFFFF]">
                    <p className="text-[#A67C00] text-xs uppercase mb-1">Bank</p>
                    <p className="text-[#2E3A46]">{selectedApp?.bankName ?? ''}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FFFFFF]">
                    <p className="text-[#A67C00] text-xs uppercase mb-1">Bank Country</p>
                    <p className="text-[#2E3A46]">{selectedApp?.bankCountry ?? ''}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FFFFFF]">
                    <p className="text-[#A67C00] text-xs uppercase mb-1">SWIFT</p>
                    <p className="text-[#2E3A46]">{selectedApp?.swiftCode ?? ''}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6 text-sm text-[#2E3A46]">
                <p>Declared net worth: {selectedApp.declaredNetWorthUsd?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? 'Not supplied — request updated evidence'}</p>
                <p>Valuation date: {selectedApp.valuationDate ?? 'Not supplied'}</p>
                <p className="whitespace-pre-wrap">{selectedApp.valuationNotes}</p>
                <p>Attestation: {selectedApp.attestedAt ? 'Recorded' : 'Missing'}. Verification expiry: {selectedApp.verifiedUntil?.slice(0, 10) ?? 'Not verified'}.</p>
                <p>Reviewer: {selectedApp.reviewedBy ?? 'Not reviewed'}</p>
                <div className="flex flex-wrap gap-4">
                  {selectedApp.passportPath && <a download href={`/api/files/${encodeURIComponent(selectedApp.passportPath)}`} className="text-[#0B6E4F] underline">Download identity document</a>}
                  {selectedApp.bankDocPath && <a download href={`/api/files/${encodeURIComponent(selectedApp.bankDocPath)}`} className="text-[#0B6E4F] underline">Download wealth evidence</a>}
                </div>
                <p>Downloads are logged. Inspect files safely; file-format checks do not detect malware or prove authenticity.</p>
              </div>
              {selectedApp && (
                <div className="space-y-4">
                  <p className="text-sm text-[#2E3A46]">Manual review: independently confirm identity, net assets minus liabilities, source of wealth, and issuer authenticity. Record your evidence and jurisdictional checks in the note. Do not approve on self-attestation alone.</p>
                  {([
                    ['identityChecked', 'Identity matches the applicant and documents'],
                    ['wealthChecked', 'Evidence supports at least USD 1M net worth and the declared tier'],
                    ['authenticityChecked', 'Evidence and issuer independently checked; checks recorded below'],
                  ] as const).map(([key, label]) => <label key={key} className="flex items-start gap-2 text-sm text-[#2E3A46]"><input type="checkbox" checked={checks[key]} onChange={e => setChecks({ ...checks, [key]: e.target.checked })} />{label}</label>)}
                  {reviewError && <p role="alert" className="text-red-700">{reviewError}</p>}
                  <textarea
                    aria-label="Review note"
                    value={reviewNote}
                    onChange={e => setReviewNote(e.target.value)}
                    className={`${inputClass} min-h-[60px]`}
                    placeholder="Required: verification sources, checks, findings, or requested information (at least 10 characters)"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReview('approve')}
                      disabled={reviewLoading || reviewNote.trim().length < 10 || !Object.values(checks).every(Boolean) || !selectedApp.attestedAt}
                      className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {reviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Approve</>}
                    </button>
                    <button
                      onClick={() => handleReview('reject')}
                      disabled={reviewLoading || reviewNote.trim().length < 10}
                      className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {reviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4" /> Reject</>}
                    </button>
                    <button onClick={() => handleReview('request_info')} disabled={reviewLoading || reviewNote.trim().length < 10} className="flex-1 rounded-lg border border-[#A67C00] text-[#A67C00] p-2 disabled:opacity-50">Request Information</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Syndicates Tab */}
        {tab === 'syndicates' && (
          <div className="space-y-3">
            {(syndicates ?? []).map((s: any) => (
              <div key={s?.id} className="p-4 rounded-xl bg-[#FFFFFF] border border-[#A67C00]/10 flex items-center justify-between">
                <div>
                  <p className="text-[#2E3A46] font-medium">{s?.name ?? ''}</p>
                  <p className="text-[#2E3A46]/40 text-sm">{s?.targetCategory ?? ''} · {s?.memberCount ?? 0} members</p>
                </div>
                <div className="text-right">
                  <p className="text-[#A67C00] font-bold">{formatCurrency(s?.poolTotal ?? 0)}</p>
                  {s?.isLocked && <span className="text-[#2E3A46]/40 text-xs">Locked</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Auctions Tab */}
        {tab === 'auctions' && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowCreateAuction(true)} className="px-4 py-2 bg-[#A67C00] text-[#FFFFFF] rounded-lg text-sm font-semibold flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Auction
              </button>
            </div>
            <div className="space-y-3">
              {(auctions ?? []).map((a: any) => (
                <div key={a?.id} className="p-4 rounded-xl bg-[#FFFFFF] border border-[#A67C00]/10 flex items-center justify-between">
                  <div>
                    <p className="text-[#2E3A46] font-medium">{a?.assetName ?? ''}</p>
                    <p className="text-[#2E3A46]/40 text-sm">{a?.category ?? ''} · {a?.bidCount ?? 0} bids</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#A67C00] font-bold">{formatCurrency(a?.currentBid ?? 0)}</p>
                    <p className="text-[#2E3A46]/40 text-xs capitalize">{a?.status ?? ''}</p>
                  </div>
                </div>
              ))}
            </div>

            {showCreateAuction && (
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                <div className="w-full max-w-lg p-8 rounded-xl bg-[#FFFFFF] border border-[#A67C00]/10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#2E3A46]">Create Auction</h2>
                    <button onClick={() => setShowCreateAuction(false)} className="text-[#2E3A46]/40 hover:text-[#2E3A46]"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-4">
                    <input value={auctionForm.assetName} onChange={e => setAuctionForm({ ...(auctionForm ?? {}), assetName: e.target.value })} className={inputClass} placeholder="Asset Name" />
                    <select value={auctionForm.category} onChange={e => setAuctionForm({ ...(auctionForm ?? {}), category: e.target.value })} className={inputClass}>
                      <option value="">Category</option>
                      {['Oceans', 'Minerals', 'Atmosphere', 'Orbital Space', 'Forests', 'Freshwater', 'Seeds', 'Soils', 'Food Supply', 'Sunlight', 'Livestock', 'Pollinators', 'Wind', 'Geothermal', 'Marine Life', 'Medicinal Plants'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <textarea value={auctionForm.description} onChange={e => setAuctionForm({ ...(auctionForm ?? {}), description: e.target.value })} className={`${inputClass} min-h-[80px]`} placeholder="Description" />
                    <input type="number" value={auctionForm.reservePrice} onChange={e => setAuctionForm({ ...(auctionForm ?? {}), reservePrice: e.target.value })} className={inputClass} placeholder="Reserve Price (USD)" />
                    <input value={auctionForm.imageUrl} onChange={e => setAuctionForm({ ...(auctionForm ?? {}), imageUrl: e.target.value })} className={inputClass} placeholder="Image URL (optional)" />
                    <select value={auctionForm.tierRequired} onChange={e => setAuctionForm({ ...(auctionForm ?? {}), tierRequired: e.target.value })} className={inputClass}>
                      <option value="">Open to all tiers</option>
                      <option value="Billionaire">Centimillionaire+</option>
                      <option value="Titan">Billionaire · Titan</option>
                    </select>
                    <p className="text-sm text-[#0B6E4F]">Bidding remains open until further notice. No automatic countdown.</p>
                    {auctionError && <p role="alert" className="text-red-700">{auctionError}</p>}
                    <button onClick={handleCreateAuction} disabled={auctionLoading || !auctionForm.assetName} className="w-full py-3 bg-[#A67C00] text-[#FFFFFF] rounded-lg font-semibold disabled:opacity-30 flex items-center justify-center gap-2">
                      {auctionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Auction'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bids Tab */}
        {tab === 'bids' && (
          <div className="space-y-3">
            {(recentBids ?? []).map((b: any) => (
              <div key={b?.id} className="p-4 rounded-xl bg-[#FFFFFF] border border-[#A67C00]/10 flex items-center justify-between">
                <div>
                  <p className="text-[#2E3A46] font-medium">{b?.bidderName ?? 'Anonymous'}</p>
                  <p className="text-[#2E3A46]/40 text-sm">on {b?.auctionName ?? ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#A67C00] font-bold">{formatCurrency(b?.amount ?? 0)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
