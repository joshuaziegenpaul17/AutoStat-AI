"use client"

import React from 'react';
import { Shield, ArrowLeft, BarChart3, Lock, Eye, Database, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
          <h1 className="text-5xl font-black uppercase tracking-tighter">Privacy Policy</h1>
          <p className="text-white/40 font-medium">Last Updated: October 2023</p>
        </div>

        <section className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3"><Database className="text-indigo-500 h-6 w-6" /> Data Collection</h2>
            <p className="text-white/60 leading-relaxed">
              AutoStat AI processes data that you explicitly provide. This includes dataset files (CSV, Excel) and any configuration parameters you set for analysis. We may also collect basic usage analytics to improve platform performance and user experience.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3"><Lock className="text-indigo-500 h-6 w-6" /> Data Processing</h2>
            <p className="text-white/60 leading-relaxed">
              All uploaded datasets are processed within a temporary environment. Data is used exclusively to generate statistical reports, forecasting models, and AI-assisted insights as requested by the user. We do not use your data for model training or unauthorized third-party sharing.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3"><Clock className="text-indigo-500 h-6 w-6" /> Data Retention</h2>
            <p className="text-white/60 leading-relaxed">
              As a temporary analytical workspace, AutoStat AI does not provide long-term storage for uploaded datasets. Files are processed for the duration of your active session. Users are responsible for clearing their session data if they wish to remove traces of analysis immediately.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3"><Shield className="text-indigo-500 h-6 w-6" /> Security Measures</h2>
            <p className="text-white/60 leading-relaxed">
              We employ professional security measures, including HTTPS/TLS encryption for all data transfers and secure cloud processing environments. While we strive to protect your information, no method of transmission over the internet is 100% secure.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3"><Eye className="text-indigo-500 h-6 w-6" /> User Controls</h2>
            <p className="text-white/60 leading-relaxed">
              You maintain full control over your data. You may choose to stop using the service at any time and clear your browser session to remove local traces of your datasets and generated insights.
            </p>
          </div>
        </section>

        <Separator className="bg-white/5" />

        <footer className="text-xs text-white/20 leading-relaxed space-y-4">
          <p>If you have questions about our privacy practices, please contact our support team through the official documentation channels.</p>
          <div className="space-y-4 pt-8">
            <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black">
              © 2026 AutoStat AI • Built by Joshua Ziegen Paul
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
