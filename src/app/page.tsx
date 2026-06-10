import Link from 'next/link';
import { BarChart3, ArrowRight, ShieldCheck, Database, LineChart, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const statusItems = [
    "ENCRYPTION: AES-256 ACTIVE",
    "DATA PRIVACY: SECURE",
    "ANALYTICS ENGINE: STANDBY",
    "PROFESSIONAL ANALYTICS ONLINE",
    "SESSION: PROTECTED",
    "PRIVACY PROTOCOLS: ACTIVE",
    "DATA INTEGRITY: VERIFIED"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/5 h-16">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <BarChart3 className="text-white h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">AutoStat AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <Link href="/dashboard" className="hover:text-white transition-colors">Workspace</Link>
            <Link href="/security" className="hover:text-white transition-colors">Security</Link>
            <Link href="/resources" className="hover:text-white transition-colors">Documentation</Link>
          </nav>
          <Link href="/dashboard">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 font-bold">
              Open Workspace
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative py-24 md:py-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-bold mb-8 uppercase tracking-widest">
              <ShieldCheck className="h-3 w-3" />
              <span>Professional Analytics Platform</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase">
              Automated <br />
              <span className="text-indigo-500">Analytics</span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Transform raw data into professional executive insights instantly. AutoStat AI provides automated statistical analysis, forecasting, and business intelligence for professional datasets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-12 h-16 text-lg font-bold group shadow-xl shadow-indigo-600/20">
                  Open Workspace <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Status Ticker */}
        <div className="relative py-12 border-y border-white/5 bg-white/[0.01] overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-12">
            {[...statusItems, ...statusItems].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <span className="text-sm font-black text-white/40 tracking-[0.3em] uppercase">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <section id="features" className="py-32 container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-12 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all group backdrop-blur-sm">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center mb-10 border border-indigo-600/30 group-hover:scale-110 transition-transform">
                <Database className="text-indigo-500 h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Data Profiling</h3>
              <p className="text-white/40 leading-relaxed font-medium">
                Comprehensive ingestion of CSV and Excel spreadsheets. Our pipeline handles automated cleaning, normalization, and quality assessment.
              </p>
            </div>
            <div className="p-12 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all group backdrop-blur-sm">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center mb-10 border border-indigo-600/30 group-hover:scale-110 transition-transform">
                <LineChart className="text-indigo-500 h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Statistical Analysis</h3>
              <p className="text-white/40 leading-relaxed font-medium">
                Automated calculation of descriptive statistics, correlation matrices, and predictive analytics using standard mathematical models.
              </p>
            </div>
            <div className="p-12 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all group backdrop-blur-sm">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center mb-10 border border-indigo-600/30 group-hover:scale-110 transition-transform">
                <FileText className="text-indigo-500 h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Executive Reporting</h3>
              <p className="text-white/40 leading-relaxed font-medium">
                Access professional-grade business insights designed for stakeholders. Includes AI-powered summaries, visualizations, and recommendations.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-16 border-t border-white/5 bg-black">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3 opacity-50">
              <BarChart3 className="h-6 w-6" />
              <span className="font-bold text-xl tracking-tighter uppercase italic">AutoStat AI</span>
            </div>
            <p className="text-[10px] text-white/30 max-w-sm leading-relaxed">
              AutoStat AI is a data analytics and reporting platform designed to assist users in exploring and understanding datasets through statistical analysis, forecasting, visualization, and AI-assisted insights.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <div className="flex flex-col gap-4">
              <p className="text-indigo-500 mb-2">Platform</p>
              <Link href="/dashboard" className="hover:text-white transition-colors">Workspace</Link>
              <Link href="/security" className="hover:text-white transition-colors">Security Center</Link>
              <Link href="/resources" className="hover:text-white transition-colors">Resources</Link>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-indigo-500 mb-2">Legal</p>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
              <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
            </div>
          </div>
          <div className="space-y-4 text-right hidden md:block">
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
