"use client"

import React from 'react';
import { FileText, ArrowLeft, BarChart3, Scale, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function TermsOfUsePage() {
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
          <h1 className="text-5xl font-black uppercase tracking-tighter">Terms of Use</h1>
          <p className="text-white/40 font-medium">Last Updated: October 2023</p>
        </div>

        <section className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3"><Info className="text-indigo-500 h-6 w-6" /> Acceptable Usage</h2>
            <p className="text-white/60 leading-relaxed">
              AutoStat AI is provided as a demonstration analytics platform. Users agree to use the service only for lawful purposes and in a manner that does not infringe the rights of others or restrict their use of the platform.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3"><Scale className="text-indigo-500 h-6 w-6" /> User Responsibilities</h2>
            <p className="text-white/60 leading-relaxed">
              Users are solely responsible for the content of the datasets they upload. You must ensure you have the necessary rights and permissions to process the data through our platform. Do not upload sensitive, confidential, or personally identifiable information (PII) that requires specific regulatory compliance.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3"><ShieldAlert className="text-indigo-500 h-6 w-6" /> Limitation of Liability</h2>
            <p className="text-white/60 leading-relaxed">
              AutoStat AI and its creators shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the platform. The service is provided "as is" without warranties of any kind.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3"><AlertCircle className="text-indigo-500 h-6 w-6" /> Intellectual Property</h2>
            <p className="text-white/60 leading-relaxed">
              The platform, including its design, source code, and logic, is the intellectual property of its creators. Users retain ownership of their uploaded data, but the platform's outputs (reports, insights) are provided for the user's specific informational use.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3"><FileText className="text-indigo-500 h-6 w-6" /> Changes to Service</h2>
            <p className="text-white/60 leading-relaxed">
              We reserve the right to modify or discontinue the service at any time without prior notice. This includes updates to technical features, AI models, and pricing structures (if applicable).
            </p>
          </div>
        </section>

        <Separator className="bg-white/5" />

        <footer className="text-xs text-white/20 leading-relaxed space-y-4">
          <p>By using AutoStat AI, you acknowledge that you have read and agree to these Terms of Use.</p>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">© 2026 AutoStat AI • Built by Joshua Ziegen Paul</p>
        </footer>
      </main>
    </div>
  );
}
