"use client"

import React from 'react';
import { 
  BarChart3, FileText, HelpCircle, Book, 
  Settings, Database, Zap, ArrowRight,
  ChevronDown, Info, Layout
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function ResourcesPage() {
  const features = [
    { title: "Automated Data Profiling", desc: "Instantly detect data types, distributions, and structural issues." },
    { title: "Statistical Modeling", desc: "Standard descriptive statistics and correlation analysis." },
    { title: "AI Executive Summaries", desc: "Automated narrative generation for stakeholder reporting." },
    { title: "Predictive Forecasting", desc: "Temporal modeling to identify sequential trends and trajectories." }
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
            <Link href="/dashboard" className="hover:text-white flex items-center gap-2">Dashboard</Link>
            <Link href="/security" className="hover:text-white flex items-center gap-2">Security</Link>
            <Link href="/resources" className="text-indigo-500 flex items-center gap-2"><HelpCircle className="h-3.5 w-3.5" /> Resources</Link>
          </nav>
        </div>
        <Link href="/dashboard">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 font-bold">
            Get Started
          </Button>
        </Link>
      </header>

      <main className="p-10 max-w-[1200px] mx-auto space-y-24 py-20">
        {/* Platform Overview */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <Badge className="bg-indigo-600/10 border-indigo-600/20 text-indigo-400 px-4 py-1 rounded-full uppercase text-[10px] tracking-widest font-bold">
              About the Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">Professional <br /> <span className="text-indigo-500">Analytics</span> Engine</h1>
            <p className="text-white/40 text-lg font-medium leading-relaxed">
              AutoStat AI is a modern analytics platform designed to bridge the gap between raw data and executive decision-making. By combining standard statistical methods with advanced automated analysis, we provide a streamlined workflow for professional data reporting.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1">{f.title}</p>
                    <p className="text-[10px] text-white/30 leading-normal">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl rounded-full" />
            <Card className="relative bg-white/5 border-white/10 rounded-[2.5rem] p-10 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="h-5 w-5 text-indigo-500" /> Technology Stack</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center group">
                  <span className="text-sm text-white/60 font-medium">Statistical Computation</span>
                  <Badge variant="outline" className="group-hover:text-white transition-colors">Standard Math Library</Badge>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-sm text-white/60 font-medium">Visualization Framework</span>
                  <Badge variant="outline" className="group-hover:text-white transition-colors">Responsive Charts</Badge>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-sm text-white/60 font-medium">Reporting Logic</span>
                  <Badge variant="outline" className="group-hover:text-white transition-colors">Automated Narrative Engine</Badge>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-sm text-white/60 font-medium">Deployment Infrastructure</span>
                  <Badge variant="outline" className="group-hover:text-white transition-colors">Server-Side Logic</Badge>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Documentation / How-to */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <Book className="h-8 w-8 text-indigo-500" />
            <h2 className="text-3xl font-black uppercase tracking-tighter">Documentation</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white/5 border-white/10 rounded-3xl p-8 space-y-4">
              <Database className="h-6 w-6 text-indigo-400" />
              <h4 className="text-xl font-bold">1. Data Preparation</h4>
              <p className="text-sm text-white/40 leading-relaxed">
                Upload CSV or Excel files with standard headers. Our platform automatically cleans whitespace and normalizes data types for consistent analysis.
              </p>
            </Card>
            <Card className="bg-white/5 border-white/10 rounded-3xl p-8 space-y-4">
              <Zap className="h-6 w-6 text-indigo-400" />
              <h4 className="text-xl font-bold">2. Automated Profiling</h4>
              <p className="text-sm text-white/40 leading-relaxed">
                The engine immediately calculates mean, median, standard deviation, and identifies outliers, providing an instant snapshot of your data health.
              </p>
            </Card>
            <Card className="bg-white/5 border-white/10 rounded-3xl p-8 space-y-4">
              <Layout className="h-6 w-6 text-indigo-400" />
              <h4 className="text-xl font-bold">3. Visual Exploration</h4>
              <p className="text-sm text-white/40 leading-relaxed">
                Use interactive tabs to toggle between histograms, correlation heatmaps, and trend lines to uncover hidden relationships in your feature sets.
              </p>
            </Card>
            <Card className="bg-white/5 border-white/10 rounded-3xl p-8 space-y-4">
              <FileText className="h-6 w-6 text-indigo-400" />
              <h4 className="text-xl font-bold">4. Report Insights</h4>
              <p className="text-sm text-white/40 leading-relaxed">
                Finalize your analysis by reviewing a comprehensive executive report that includes statistical findings and AI-powered recommendations.
              </p>
            </Card>
          </div>
        </section>

        {/* Help Center / FAQ */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <HelpCircle className="h-8 w-8 text-indigo-500" />
            <h2 className="text-3xl font-black uppercase tracking-tighter">Help Center</h2>
          </div>
          
          <Card className="bg-white/5 border-white/10 rounded-3xl p-10">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-white/5">
                <AccordionTrigger className="text-left font-bold text-lg hover:no-underline py-6">What file formats are supported?</AccordionTrigger>
                <AccordionContent className="text-white/40 text-sm leading-relaxed pb-6">
                  Currently, we support .CSV, .XLSX, and .XLS files. Ensure your dataset has a clear header row for accurate feature identification.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-white/5">
                <AccordionTrigger className="text-left font-bold text-lg hover:no-underline py-6">How is my data secured?</AccordionTrigger>
                <AccordionContent className="text-white/40 text-sm leading-relaxed pb-6">
                  Datasets are processed temporarily for analysis and are never permanently stored on our servers. All transfers are encrypted via TLS 1.3.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-white/5">
                <AccordionTrigger className="text-left font-bold text-lg hover:no-underline py-6">How does forecasting work?</AccordionTrigger>
                <AccordionContent className="text-white/40 text-sm leading-relaxed pb-6">
                  We use sequential trend modeling to identify trajectories in your numeric fields. This is most effective for time-series data or ordered sequences.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-white/5">
                <AccordionTrigger className="text-left font-bold text-lg hover:no-underline py-6">Need additional support?</AccordionTrigger>
                <AccordionContent className="text-white/40 text-sm leading-relaxed pb-6">
                  For professional inquiries or specific technical support, please contact our analytical support team via the contact details provided in your agreement.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </section>

        <section className="bg-indigo-600 rounded-[2.5rem] p-16 text-center space-y-8">
          <h2 className="text-4xl font-black uppercase tracking-tighter">Ready to analyze your data?</h2>
          <p className="text-indigo-100 max-w-xl mx-auto font-medium opacity-80">
            Join users transforming raw data into high-fidelity executive insights with AutoStat AI.
          </p>
          <Link href="/dashboard" className="block">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90 rounded-full px-12 h-16 font-bold uppercase tracking-widest text-xs">
              Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 bg-black/40">
        <div className="container mx-auto px-10 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-4 opacity-40">
              <BarChart3 className="h-6 w-6" />
              <span className="font-bold text-xl tracking-tighter uppercase italic text-white">AutoStat AI</span>
            </div>
            <p className="text-[10px] text-white/20 max-w-sm leading-relaxed">
              AutoStat AI is a data analytics and reporting platform designed to assist users in exploring and understanding datasets through statistical analysis, forecasting, visualization, and AI-assisted insights.
            </p>
          </div>
          <div className="flex flex-wrap gap-12 text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">
            <div className="flex flex-col gap-4">
              <p className="text-indigo-500 opacity-60">Legal</p>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
              <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-indigo-500 opacity-60">Resources</p>
              <Link href="/resources" className="hover:text-white transition-colors">Documentation</Link>
              <Link href="/security" className="hover:text-white transition-colors">Security Center</Link>
            </div>
          </div>
          <div className="md:text-right space-y-2">
            <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black">
              © 2026 AutoStat AI • Built by Joshua Ziegen Paul
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
