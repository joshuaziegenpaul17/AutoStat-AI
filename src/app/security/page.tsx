"use client"

import React from 'react';
import { 
  ShieldCheck, Lock, Eye, Trash2, Key, 
  Info, Shield, Clock, FileText, Activity,
  ArrowLeft, BarChart3, Database, Tag
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function SecurityPage() {
  const securityFeatures = [
    {
      title: "Data Sovereignty",
      desc: "Mathematical calculations and statistical profiling are performed locally in your browser. Raw datasets are not stored on our servers.",
      icon: ShieldCheck
    },
    {
      title: "Encrypted Transport",
      desc: "All communication between users and the platform is protected using HTTPS/TLS industry-standard encryption protocols.",
      icon: Lock
    },
    {
      title: "Structural Integrity",
      desc: "Automated input validation and cleaning help ensure data quality and reduce processing errors.",
      icon: Shield
    },
    {
      title: "Ephemeral Processing",
      desc: "Datasets and reports are processed within your active session. We do not provide long-term storage or unauthorized access.",
      icon: Trash2
    },
    {
      title: "Secure Architecture",
      desc: "The platform is designed with a modern, isolated architecture to protect user interactions and data artifacts.",
      icon: Key
    },
    {
      title: "Process Transparency",
      desc: "AutoStat AI is designed as a professional demonstration platform for modern analytics and executive reporting.",
      icon: Info
    }
  ];

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
          <div className="h-6 w-px bg-white/10" />
          <nav className="flex items-center gap-8 text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
            <Link href="/dashboard" className="hover:text-white flex items-center gap-2">Workspace</Link>
            <Link href="/security" className="text-indigo-500 flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> Security</Link>
            <Link href="/resources" className="hover:text-white flex items-center gap-2">Resources</Link>
          </nav>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 rounded-full px-6 text-xs uppercase tracking-widest font-bold">
            <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Workspace
          </Button>
        </Link>
      </header>

      <main className="p-10 max-w-[1200px] mx-auto space-y-20 py-20">
        <section className="text-center space-y-6">
          <Badge className="bg-indigo-600/10 border-indigo-600/20 text-indigo-400 px-4 py-1 rounded-full uppercase text-[10px] tracking-widest font-bold">
            Trust & Security Architecture
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Security & <span className="text-indigo-500">Privacy</span></h1>
          <p className="text-white/40 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            AutoStat AI is designed following industry best practices for data processing and secure analytical workflows. Your privacy and data integrity are our primary architectural priorities.
          </p>
        </section>

        {/* Security Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {securityFeatures.map((f, i) => (
            <Card key={i} className="bg-white/5 border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center mb-6 text-indigo-500 group-hover:scale-110 transition-transform">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-4">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed font-medium">{f.desc}</p>
            </Card>
          ))}
        </section>

        <Separator className="bg-white/5" />

        {/* Platform Status Section */}
        <section className="space-y-12">
          <div className="flex items-center gap-4 mb-10">
            <Activity className="h-8 w-8 text-indigo-500" />
            <h2 className="text-3xl font-black uppercase tracking-tighter">Platform Integrity</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <Card className="bg-indigo-600/5 border-indigo-500/20 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Tag className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Version</span>
              </div>
              <p className="text-xl font-black">v2.5.0 Stable</p>
            </Card>
            
            <Card className="bg-indigo-600/5 border-indigo-500/20 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Lock className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Encryption</span>
              </div>
              <p className="text-xl font-black">HTTPS/TLS 1.3</p>
            </Card>

            <Card className="bg-indigo-600/5 border-indigo-500/20 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Activity className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Availability</span>
              </div>
              <p className="text-xl font-black text-emerald-400 font-mono text-sm uppercase">High Redundancy</p>
            </Card>

            <Card className="bg-indigo-600/5 border-indigo-500/20 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Session Status</span>
              </div>
              <p className="text-xl font-black font-mono text-xs">ACTIVE_BROWSER_ONLY</p>
            </Card>

            <Card className="bg-indigo-600/5 border-indigo-500/20 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Database className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Architecture</span>
              </div>
              <p className="text-xl font-black">Local-First</p>
            </Card>
          </div>
          
          <Card className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden">
            <div className="p-10 space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <Info className="h-6 w-6 text-indigo-500" />
                <h4 className="text-lg font-bold">Standard Disclosure</h4>
              </div>
              <p className="text-white/50 leading-relaxed font-medium">
                AutoStat AI is designed following professional industry best practices to ensure secure and reliable analytical outcomes. By leveraging local-first processing, we minimize data exposure while providing sophisticated business intelligence tools. This platform demonstrates advanced statistical modeling and executive reporting capabilities within a privacy-conscious framework.
              </p>
            </div>
          </Card>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 bg-black/40">
        <div className="container mx-auto px-10 flex flex-col md:flex-row justify-between items-start gap-12 text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-4 opacity-40">
              <BarChart3 className="h-6 w-6" />
              <span className="font-bold text-xl tracking-tighter uppercase italic text-white">AutoStat AI</span>
            </div>
            <p className="text-[10px] text-white/20 max-w-sm leading-relaxed uppercase tracking-wider font-bold">
              Informational Analytics Platform • Not Professional Advice
            </p>
          </div>
          <div className="flex flex-wrap gap-12 text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">
            <div className="flex flex-col gap-4">
              <p className="text-indigo-500 opacity-60">Legal</p>
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white">Terms of Use</Link>
              <Link href="/disclaimer" className="hover:text-white">Disclaimer</Link>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-indigo-500 opacity-60">Platform</p>
              <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
              <Link href="/resources" className="hover:text-white">Resources</Link>
            </div>
          </div>
          <div className="md:text-right space-y-2">
            <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black">
              © 2025 AUTOSTAT ANALYTICS
            </p>
            <p className="text-[10px] text-white/10 uppercase tracking-[0.2em] font-bold">
              v2.5.0 STABLE • SECURE PROCESSING
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
