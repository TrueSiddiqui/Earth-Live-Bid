"use client";

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Shield, LogOut, LayoutDashboard, Gavel, Users, Radio } from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession() || {};
  const [isOpen, setIsOpen] = useState(false);
  const user = session?.user as any;
  const isAdmin = user?.role === 'admin';
  const isApproved = user?.status === 'approved';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#FFFFFF]/80 border-b border-[#A67C00]/10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#A67C00]" />
            <span className="font-['Playfair_Display'] text-base sm:text-lg md:text-xl font-bold gold-text leading-tight">Top G Deception Bids<span className="hidden sm:inline"> on Planet Earth.</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/live" className="px-3 py-2 text-sm text-[#0B6E4F] hover:text-[#0B6E4F]/80 transition-colors flex items-center gap-1.5 font-medium">
              <Radio className="w-4 h-4" /> Watch Live
            </Link>
            {session ? (
              <>
                {isApproved && (
                  <>
                    <Link href="/dashboard" className="px-3 py-2 text-sm text-[#2E3A46]/70 hover:text-[#A67C00] transition-colors flex items-center gap-1.5">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/auctions" className="px-3 py-2 text-sm text-[#2E3A46]/70 hover:text-[#A67C00] transition-colors flex items-center gap-1.5">
                      <Gavel className="w-4 h-4" /> Auctions
                    </Link>
                    <Link href="/syndicates" className="px-3 py-2 text-sm text-[#2E3A46]/70 hover:text-[#A67C00] transition-colors flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> Syndicates
                    </Link>
                  </>
                )}
                {!isApproved && (
                  <Link href="/dashboard" className="px-3 py-2 text-sm text-[#2E3A46]/70 hover:text-[#A67C00] transition-colors flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin" className="px-3 py-2 text-sm text-[#A67C00] hover:text-[#A67C00]/80 transition-colors flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut({ redirectTo: '/' })}
                  className="ml-2 px-4 py-2 text-sm bg-[#A67C00]/10 text-[#A67C00] rounded-lg hover:bg-[#A67C00]/20 transition-all flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm text-[#2E3A46]/70 hover:text-[#A67C00] transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="px-5 py-2 text-sm bg-[#A67C00] text-[#FFFFFF] rounded-lg font-semibold hover:bg-[#A67C00]/90 transition-all">
                  Apply Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-[#2E3A46]/70">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#FFFFFF]/95 border-b border-[#A67C00]/10"
          >
            <div className="px-4 py-4 space-y-2">
              <Link href="/live" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm text-[#0B6E4F] font-medium">Watch Live</Link>
              {session ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm text-[#2E3A46]/70 hover:text-[#A67C00]">Dashboard</Link>
                  {isApproved && (
                    <>
                      <Link href="/auctions" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm text-[#2E3A46]/70 hover:text-[#A67C00]">Auctions</Link>
                      <Link href="/syndicates" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm text-[#2E3A46]/70 hover:text-[#A67C00]">Syndicates</Link>
                    </>
                  )}
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm text-[#A67C00]">Admin</Link>
                  )}
                  <button onClick={() => signOut({ redirectTo: '/' })} className="block w-full text-left px-3 py-2 text-sm text-[#A67C00]">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm text-[#2E3A46]/70">Sign In</Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm text-[#A67C00] font-semibold">Apply Now</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
