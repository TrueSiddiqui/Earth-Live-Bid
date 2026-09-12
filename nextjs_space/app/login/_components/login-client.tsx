"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('Invalid credentials. Please try again.');
      } else {
        router.replace('/dashboard');
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFFFF] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#A67C0008_0%,_transparent_50%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Globe className="w-8 h-8 text-[#A67C00]" />
            <span className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold gold-text leading-tight">Top G Deception Bids on Planet Earth.</span>
          </Link>
          <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2E3A46] mb-2">Member Access</h1>
          <p className="text-[#2E3A46]/50">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 rounded-xl bg-[#FFFFFF] border border-[#A67C00]/10 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm text-[#2E3A46]/60 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2E3A46]/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-[#FFFFFF] border border-[#A67C00]/10 rounded-lg text-[#2E3A46] placeholder-[#2E3A46]/20 focus:border-[#A67C00]/40 focus:outline-none transition-colors"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#2E3A46]/60 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2E3A46]/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-[#FFFFFF] border border-[#A67C00]/10 rounded-lg text-[#2E3A46] placeholder-[#2E3A46]/20 focus:border-[#A67C00]/40 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#A67C00] text-[#FFFFFF] rounded-lg font-semibold hover:bg-[#A67C00]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Sign In</>}
          </button>

          <p className="text-center text-sm text-[#2E3A46]/40">
            Not a member?{' '}
            <Link href="/signup" className="text-[#A67C00] hover:underline">Apply Now</Link>
          </p>
        </form>
      </motion.div>
    </main>
  );
}
