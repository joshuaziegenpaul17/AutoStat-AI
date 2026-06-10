import Link from 'next/link';
import { BarChart3, ArrowRight, ShieldCheck, Zap, Database, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/5 h-16">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <BarChart3 className="text-white h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">AutoStat AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#analysis" className="hover:text-white transition-colors">Analysis</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </nav>
          <Link href="/dashboard">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative py-24 md:py-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-bold mb-8">
              <Zap className="h-3 w-3" />
              <span>Next-Gen Statistical Engine v2.0</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
              Statistical Intelligence <br />
              <span className="text-indigo-500">Built for Modern Teams.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
              Upload datasets and generate professional statistical reports instantly. AutoStat AI transforms raw CSV data into structured strategic intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-12 h-14 text-lg font-bold group">
                  Upload CSV <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-full px-12 h-14 text-lg font-bold border-white/10 hover:bg-white/5">
                View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center mb-8 border border-indigo-600/30 group-hover:scale-110 transition-transform">
                <Database className="text-indigo-500 h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-4">Instant Ingestion</h3>
              <p className="text-white/40 leading-relaxed">
                Drag and drop your CSV or Excel files. Our pipeline automatically handles cleaning, type mapping, and normalization.
              </p>
            </div>
            <div className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center mb-8 border border-indigo-600/30 group-hover:scale-110 transition-transform">
                <BarChart3 className="text-indigo-500 h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-4">Deep Analytics</h3>
              <p className="text-white/40 leading-relaxed">
                Automated calculation of descriptive statistics, Pearson correlation, and distribution binnings.
              </p>
            </div>
            <div className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center mb-8 border border-indigo-600/30 group-hover:scale-110 transition-transform">
                <Globe className="text-indigo-500 h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-4">Universal Export</h3>
              <p className="text-white/40 leading-relaxed">
                Download structured Mission Logs or professional statistical reports in high-fidelity text formats.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <BarChart3 className="h-5 w-5" />
            <span className="font-bold">AutoStat AI</span>
          </div>
          <p className="text-xs text-white/20 uppercase tracking-widest font-bold">
            © 2024 AUTOSTAT SYSTEMS • ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>
    </div>
  );
}