"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { getTierFromNetWorth, getTierLabel } from '@/lib/utils';
import { MAX_DOCUMENT_SIZE, DOCUMENT_TYPES, wealthRange } from '@/lib/verification';
import {
  User, Wallet, Building2, FileCheck, ArrowRight, ArrowLeft,
  Upload, Loader2, CheckCircle, Globe
} from 'lucide-react';

const steps = [
  { title: 'Personal Identity', icon: User },
  { title: 'Wealth Declaration', icon: Wallet },
  { title: 'Banking Institution', icon: Building2 },
  { title: 'Review & Submit', icon: FileCheck },
];

const assetClasses = ['Real Estate', 'Equities', 'Business', 'Other'];

export function ApplyClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1
  const [legalName, setLegalName] = useState('');
  const [nationality, setNationality] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [countryResidence, setCountryResidence] = useState('');
  const [passportFile, setPassportFile] = useState<File | null>(null);

  // Step 2
  const [declaredNetWorthUsd, setDeclaredNetWorthUsd] = useState('');
  const [valuationDate, setValuationDate] = useState('');
  const [valuationNotes, setValuationNotes] = useState('');
  const netWorthRange = Number(declaredNetWorthUsd) >= 1_000_000 ? wealthRange(Number(declaredNetWorthUsd)) : '';
  const [sourceOfWealth, setSourceOfWealth] = useState('');
  const [primaryAssetClass, setPrimaryAssetClass] = useState('');

  // Step 3
  const [bankName, setBankName] = useState('');
  const [bankCountry, setBankCountry] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [bankDocFile, setBankDocFile] = useState<File | null>(null);

  // Step 4
  const [acceptTerms, setAcceptTerms] = useState(false);

  const tier = netWorthRange ? getTierFromNetWorth(netWorthRange) : '';

  const chooseFile = (file: File | null, setFile: (file: File | null) => void) => {
    setError('');
    if (file && (!DOCUMENT_TYPES.includes(file.type) || file.size > MAX_DOCUMENT_SIZE || file.size === 0)) {
      setError('Use a nonempty PDF, JPEG, or PNG up to 10 MB.'); setFile(null); return;
    }
    setFile(file);
  };
  const uploadFile = async (file: File): Promise<{ cloud_storage_path: string; isPublic: boolean } | null> => {
    try {
      const res = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size, isPublic: false }),
      });
      const data = await res.json();
      if (!res.ok) return null;

      const upload = await fetch(data?.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!upload.ok) throw new Error('Document upload failed');
      return { cloud_storage_path: data?.cloud_storage_path ?? '', isPublic: false };
    } catch (error) {
      console.error('Upload failed', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      let passportPath = '';
      let bankDocPath = '';

      if (passportFile) {
        const result = await uploadFile(passportFile);
        passportPath = result?.cloud_storage_path ?? '';
      }
      if (bankDocFile) {
        const result = await uploadFile(bankDocFile);
        bankDocPath = result?.cloud_storage_path ?? '';
      }

      if (!passportPath || !bankDocPath) { setError('Both documents must upload successfully. Please try again.'); return; }
      const res = await fetch('/api/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legalName, nationality, dateOfBirth, countryResidence,
          passportPath, netWorthRange, tier, sourceOfWealth,
          primaryAssetClass, bankName, bankCountry, swiftCode, bankDocPath,
          declaredNetWorthUsd: Number(declaredNetWorthUsd), valuationDate, valuationNotes, acceptTerms,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data?.error ?? 'Failed to submit');
        return;
      }

      router.replace('/dashboard');
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return legalName.trim() && nationality.trim() && dateOfBirth && countryResidence.trim() && passportFile;
    if (step === 1) return netWorthRange && sourceOfWealth.trim().length >= 10 && primaryAssetClass && valuationDate && valuationNotes.trim().length >= 20;
    if (step === 2) return bankName.trim() && bankCountry.trim() && bankDocFile;
    if (step === 3) return acceptTerms;
    return true;
  };

  const inputClass = "w-full px-4 py-3 bg-[#FFFFFF] border border-[#A67C00]/10 rounded-lg text-[#2E3A46] placeholder-[#2E3A46]/20 focus:border-[#A67C00]/40 focus:outline-none transition-colors";
  const labelClass = "block text-sm text-[#2E3A46]/60 mb-1.5";

  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto">
        <h1 className="font-['Playfair_Display'] text-3xl text-[#0B6E4F] mb-3">Identity & Wealth Verification</h1>
        <p className="text-sm text-[#2E3A46] mb-6">Applications are open worldwide. Minimum net worth: USD 1,000,000 after liabilities. Evidence must support your valuation within the past 90 days. Approval is a manual review, valid for one year—not a guarantee of wealth or available funds.</p>
        <p className="text-sm text-[#2E3A46] mb-6">Documents are private and available only to authorized reviewers. Upload PDF, JPEG, or PNG (10 MB maximum each). Never upload passwords or account access credentials. Documents are retained for review; automated deletion is not currently enabled.</p>
        {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
        {/* Steps indicator */}
        <div className="flex items-center justify-between mb-10">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  i === step ? 'bg-[#A67C00]/10 text-[#A67C00]' :
                  i < step ? 'text-green-400' : 'text-[#2E3A46]/30'
                }`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{s.title}</span>
                </div>
                {i < steps.length - 1 && <div className={`w-8 h-px mx-2 ${i < step ? 'bg-green-400/30' : 'bg-[#A67C00]/10'}`} />}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="p-8 rounded-xl bg-[#FFFFFF] border border-[#A67C00]/10"
          >
            {/* Step 1: Personal Identity */}
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2E3A46] mb-6">Personal Identity</h2>
                <div>
                  <label className={labelClass}>Full Legal Name</label>
                  <input type="text" value={legalName} onChange={e => setLegalName(e.target.value)} className={inputClass} placeholder="As on passport" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Nationality</label>
                    <input type="text" value={nationality} onChange={e => setNationality(e.target.value)} className={inputClass} placeholder="e.g. Swiss" />
                  </div>
                  <div>
                    <label className={labelClass}>Date of Birth</label>
                    <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Country of Residence</label>
                  <input type="text" value={countryResidence} onChange={e => setCountryResidence(e.target.value)} className={inputClass} placeholder="e.g. United Arab Emirates" />
                </div>
                <div>
                  <label className={labelClass}>Passport Upload</label>
                  <label className="flex items-center gap-3 px-4 py-3 bg-[#FFFFFF] border border-dashed border-[#A67C00]/20 rounded-lg cursor-pointer hover:border-[#A67C00]/40 transition-colors">
                    <Upload className="w-5 h-5 text-[#A67C00]" />
                    <span className="text-[#2E3A46]/50 text-sm">{passportFile?.name ?? 'Choose file...'}</span>
                    <input aria-label="Identity document" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => chooseFile(e.target.files?.[0] ?? null, setPassportFile)} />
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Wealth Declaration */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2E3A46] mb-6">Wealth Declaration</h2>
                <div>
                  <label className={labelClass}>Net Worth — USD Equivalent (Assets Minus Liabilities)</label>
                  <input aria-label="Net worth USD" type="number" min="1000000" step="0.01" value={declaredNetWorthUsd} onChange={e => setDeclaredNetWorthUsd(e.target.value)} className={inputClass} />
                  <label className={`${labelClass} mt-4`}>Valuation Date (Within 90 Days)</label>
                  <input aria-label="Valuation date" type="date" value={valuationDate} onChange={e => setValuationDate(e.target.value)} className={inputClass} />
                  <label className={`${labelClass} mt-4`}>Valuation & Currency Conversion Notes</label>
                  <textarea aria-label="Valuation notes" value={valuationNotes} onChange={e => setValuationNotes(e.target.value)} className={inputClass} placeholder="List assets, liabilities, your ownership share, and illiquid-asset valuation basis. For non-USD assets, give the exchange rate, source, and date; for USD-only assets, say so." />
                  {tier && (
                    <p className="text-[#A67C00] text-sm mt-2">Provisional tier: <span className="font-bold">{getTierLabel(tier)}</span></p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Source of Wealth</label>
                  <textarea value={sourceOfWealth} onChange={e => setSourceOfWealth(e.target.value)} className={`${inputClass} min-h-[80px]`} placeholder="Describe your primary wealth source..." />
                </div>
                <div>
                  <label className={labelClass}>Primary Asset Class</label>
                  <select value={primaryAssetClass} onChange={e => setPrimaryAssetClass(e.target.value)} className={inputClass}>
                    <option value="">Select</option>
                    {assetClasses.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Banking */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2E3A46] mb-6">Banking Institution</h2>
                <div>
                  <label className={labelClass}>Primary Bank Name</label>
                  <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className={inputClass} placeholder="e.g. UBS Private Banking" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Bank Account Country</label>
                    <input type="text" value={bankCountry} onChange={e => setBankCountry(e.target.value)} className={inputClass} placeholder="e.g. Switzerland" />
                  </div>
                  <div>
                    <label className={labelClass}>SWIFT/BIC Code (Optional)</label>
                    <input type="text" value={swiftCode} onChange={e => setSwiftCode(e.target.value)} className={inputClass} placeholder="e.g. UBSWCHZH" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Wealth Evidence (Required)</label>
                  <p className="text-sm text-[#2E3A46] mb-3">Provide consolidated statements or an accountant/auditor letter substantiating net assets and liabilities. Combine supporting pages into one PDF. A balance or asset title alone does not prove total net worth. Include a translation when necessary for review.</p>
                  <label className="flex items-center gap-3 px-4 py-3 bg-[#FFFFFF] border border-dashed border-[#A67C00]/20 rounded-lg cursor-pointer hover:border-[#A67C00]/40 transition-colors">
                    <Upload className="w-5 h-5 text-[#A67C00]" />
                    <span className="text-[#2E3A46]/50 text-sm">{bankDocFile?.name ?? 'Choose file...'}</span>
                    <input aria-label="Wealth document" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => chooseFile(e.target.files?.[0] ?? null, setBankDocFile)} />
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2E3A46] mb-6">Review & Submit</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#A67C00]/5">
                    <p className="text-[#A67C00] text-xs uppercase tracking-wider mb-2">Personal</p>
                    <p className="text-[#2E3A46]">{legalName} · {nationality} · {countryResidence}</p>
                    <p className="text-[#2E3A46]/50 text-sm">DOB: {dateOfBirth}</p>
                    {passportFile && <p className="text-[#2E3A46]/40 text-xs mt-1">Passport: {passportFile.name}</p>}
                  </div>
                  <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#A67C00]/5">
                    <p className="text-[#A67C00] text-xs uppercase tracking-wider mb-2">Wealth</p>
                    <p className="text-[#2E3A46]">{netWorthRange} — <span className="font-bold text-[#A67C00]">{getTierLabel(tier)}</span></p>
                    <p className="text-[#2E3A46]/50 text-sm">{sourceOfWealth}</p>
                    <p className="text-[#2E3A46]/40 text-xs mt-1">Asset class: {primaryAssetClass}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#A67C00]/5">
                    <p className="text-[#A67C00] text-xs uppercase tracking-wider mb-2">Banking</p>
                    <p className="text-[#2E3A46]">{bankName} ({bankCountry})</p>
                    <p className="text-[#2E3A46]/50 text-sm">SWIFT: {swiftCode}</p>
                    {bankDocFile && <p className="text-[#2E3A46]/40 text-xs mt-1">Document: {bankDocFile.name}</p>}
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} className="w-4 h-4 accent-[#A67C00]" />
                  <span className="text-[#2E3A46]/50 text-sm">I attest that these documents are mine, the declaration accurately reflects my assets minus liabilities, and I authorize manual identity and wealth review. I understand that an applicant account is not membership approval.</span>
                </label>
                {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {step > 0 ? (
                <button onClick={() => setStep(step - 1)} className="px-5 py-2 border border-[#A67C00]/20 text-[#A67C00] rounded-lg text-sm hover:bg-[#A67C00]/10 transition-all flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : <div />}
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canNext()}
                  className="px-5 py-2 bg-[#A67C00] text-[#FFFFFF] rounded-lg text-sm font-semibold hover:bg-[#A67C00]/90 transition-all disabled:opacity-30 flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!acceptTerms || loading}
                  className="px-5 py-2 bg-[#A67C00] text-[#FFFFFF] rounded-lg text-sm font-semibold hover:bg-[#A67C00]/90 transition-all disabled:opacity-30 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Globe className="w-4 h-4" /> Submit Application</>}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
