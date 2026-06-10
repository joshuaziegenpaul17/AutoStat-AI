
"use client"

import React from 'react';
import { 
  ShieldCheck, Lock, Eye, Trash2, Key, 
  FileCheck, Shield, Clock, FileText, Activity,
  ArrowLeft, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function SecurityPage() {
  const securityFeatures = [
    {
      title: "Data Privacy",
      desc: "Uploaded files are processed in a secure environment and never shared with unauthorized third parties.",
      icon: Eye
    },
    {
      title: "Encryption",
      desc: "All communication is protected via industry-standard HTTPS/TLS encryption for secure data transfer.",
      icon: Lock
    },
    {
      title: "Data Protection",
      desc: "Comprehensive input validation and sanitization prevent malicious activity and ensure data integrity.",
      icon: ShieldCheck
    },
    {
      title: "Privacy Controls",
      desc: "Users maintain full control over their data, with options to delete datasets and clear analysis history instantly.",
      icon: Trash2
    },
    {
      title: "Access Control",
      desc: "Session-based protection and secure API interactions ensure only authorized users access generated reports.",
      icon: Key
    },
    {
      title: "Audit Compliance",
      desc: "Detailed logging of analytical sessions allows for transparent tracking of report generation and data activity.",
      icon: FileCheck
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
            Trust & Security Center
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Security & <span className="text-indigo-500">Privacy</span></h1>
          <p className="text-white/40 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Our platform is built on enterprise-grade security protocols to ensure your datasets remain private, secure, and under your absolute control.
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

        {/* Trust Center / Audit Section */}
        <section className="space-y-12">
          <div className="flex items-center gap-4 mb-10">
            <Shield className="h-8 w-8 text-indigo-500" />
            <h2 className="text-3xl font-black uppercase tracking-tighter">Trust & Audit Summary</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-indigo-600/5 border-indigo-500/20 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400">
                <Clock className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">System Uptime</span>
              </div>
              <p className="text-4xl font-black">99.9%</p>
              <p className="text-xs text-white/40 font-medium">Verified platform availability</p>
            </Card>
            <Card className="bg-indigo-600/5 border-indigo-500/20 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400">
                <Activity className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Data Processing</span>
              </div>
              <p className="text-4xl font-black">Encrypted</p>
              <p className="text-xs text-white/40 font-medium">TLS 1.3 Transmission Security</p>
            </Card>
            <Card className="bg-indigo-600/5 border-indigo-500/20 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400">
                <FileText className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Compliance</span>
              </div>
              <p className="text-4xl font-black">Verified</p>
              <p className="text-xs text-white/40 font-medium">Industry Best Practices</p>
            </Card>
          </div>
          
          <Card className="bg-white/5 border-white/10 rounded-3xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">Analytical Session Summary</h4>
              <Badge variant="outline" className="text-indigo-400 border-indigo-400/20">v2.5.0 STABLE</Badge>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/40">Last Analysis Performed</span>
                <span className="text-sm font-mono">{new Date().toLocaleTimeString()} Today</span>
              </div>
              <Separator className="bg-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/40">Analytics Report History</span>
                <span className="text-sm font-mono">Active Session Data</span>
              </div>
              <Separator className="bg-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/40">Dataset Activity Status</span>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Securely Cleared</Badge>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 bg-black/40">
        <div className="container mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4 opacity-40">
            <BarChart3 className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tighter uppercase italic">AutoStat AI</span>
          </div>
          <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black">
            TRUST CENTER • PRIVACY FIRST ANALYTICS
          </p>
        </div>
      </footer>
    </div>
  );
}
