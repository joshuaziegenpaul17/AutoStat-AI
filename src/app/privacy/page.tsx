"use client"

import React from 'react';
import { Shield, ArrowLeft, BarChart3, Lock, Eye, Database, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans selection:bg-indigo-500/30">
      <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <BarChart3 className="text-white h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">AutoStat AI</span>
          </Link>
        </div>
        <Link href="/">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 rounded-full px-6 text-xs uppercase tracking-widest font-bold">
            <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Home
          </Button>
        </Link>
      </header>

      <main className="p-10 max-w-[900px] mx-auto py-20 space-y-16">
        <div className="space-y-4">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white">Privacy Policy</h1>
          <p className="text-white/40 font-medium">Last Updated: 11 June 2026</p>
        </div>

        <section className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3"><Database className="text-indigo-500 h-6 w-6" /> Data Collection</h2>
            <p className="text-white/60 leading-relaxed">
              We may collect limited technical and usage information necessary for platform functionality, performance monitoring, error diagnostics, and service improvement. No uploaded dataset content is used for AI model training unless explicitly stated.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3"><Lock className="text-indigo-500 h-6 w-6" /> Data Processing</h2>
            <p className="text-white/60 leading-relaxed">
              Uploaded datasets are processed solely for the purpose of generating statistical analyses, visualizations, forecasts, and AI-assisted insights requested by the user. AutoStat AI does not intentionally sell, rent, or share uploaded dataset content with third parties for marketing purposes.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3"><Clock className="text-indigo-500 h-6 w-6" /> Data Retention</h2>
            <p className="text-white/60 leading-relaxed">
              AutoStat AI is designed as a temporary analytical workspace. Uploaded datasets are processed during active sessions and are not intended for permanent storage. Users are responsible for maintaining their own backups and for removing data they no longer wish to process through the platform.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3"><Shield className="text-indigo-500 h-6 w-6" /> Security Measures</h2>
            <p className="text-white/60 leading-relaxed">
              AutoStat AI utilizes industry-standard security practices, including encrypted HTTPS/TLS communication and secure cloud infrastructure provided by third-party hosting providers. While reasonable measures are taken to protect information, no electronic storage or transmission method can be guaranteed to be completely secure.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3"><Eye className="text-indigo-500 h-6 w-6" /> User Controls</h2>
            <p className="text-white/60 leading-relaxed">
              Users maintain control over the data they choose to upload. Users may discontinue use of the platform at any time and are encouraged to avoid uploading confidential, regulated, or highly sensitive information unless appropriate safeguards and permissions are in place.
            </p>
          </div>
        </section>

        <Separator className="bg-white/5" />

        <section className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 shadow-2xl shadow-black/20 space-y-4">
          <h2 className="text-xl font-black uppercase tracking-[0.35em] text-white/90">Disclaimer</h2>
          <p className="text-white/70 leading-relaxed text-sm">
            AutoStat AI provides statistical analysis, forecasting, visualization, and AI-assisted insights for informational purposes only. Results may contain inaccuracies, estimation errors, or AI-generated interpretations that should be independently verified before being used for financial, legal, medical, business, academic, or operational decision-making.
          </p>
        </section>

        <footer className="text-xs text-white/20 leading-relaxed space-y-4">
          <p>If you have questions regarding this Privacy Policy or the platform, please contact the project developer through the available contact channels.</p>
          <div className="space-y-4 pt-8">
            <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black">
              © 2026 AutoStat AI • Built by Joshua Ziegen Paul
            </p>
            <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">
              All Rights Reserved
            </p>
            <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">
              For Educational, Research, and Informational Use
            </p>
            <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">
              Statistical Analysis • Forecasting • AI-Assisted Insights
            </p>
            <div className="flex gap-4 text-[9px] font-bold uppercase tracking-widest text-white/30">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span className="opacity-20">|</span>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
              <span className="opacity-20">|</span>
              <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
