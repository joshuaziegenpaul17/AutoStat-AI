import Link from 'next/link';
import { ArrowRight, BarChart3, ShieldCheck, Zap, Globe, Cpu, Database, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen selection:bg-primary selection:text-black data-grid">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 backdrop-blur-3xl">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center glow-primary transition-transform hover:rotate-3">
              <BarChart3 className="text-black h-7 w-7" />
            </div>
            <span className="text-3xl font-headline font-bold tracking-tighter">AutoStat<span className="text-primary italic">AI</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <a href="#capabilities" className="text-sm font-semibold hover:text-primary transition-all tracking-wide">CAPABILITIES</a>
            <a href="#docs" className="text-sm font-semibold hover:text-primary transition-all tracking-wide">DOCUMENTATION</a>
          </nav>
          <div className="flex items-center gap-6">
            <Button variant="ghost" className="text-sm font-bold opacity-70 hover:opacity-100">Log in</Button>
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90 text-black text-sm font-black rounded-full px-8 h-12 shadow-xl shadow-primary/10">
                GET STARTED
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-40 pb-24 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-primary/5 blur-[160px] rounded-full -z-10" />
          <div className="container mx-auto px-6 text-center max-w-5xl">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full glass border-white/10 text-primary text-xs font-black mb-10 tracking-[0.2em] animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Cpu className="h-4 w-4" />
              <span>QUANTUM ANALYTICS ENGINE 3.0</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-headline font-bold mb-10 leading-[0.9] tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Raw Data to <span className="text-primary underline decoration-primary/20 underline-offset-8">Insight</span>.
            </h1>
            <p className="text-2xl text-muted-foreground mb-16 max-w-3xl mx-auto leading-relaxed font-light animate-in fade-in slide-in-from-bottom-12 duration-1000">
              The professional environment for automated statistical workflows. Upload any dataset for instant cleaning, deep visual discovery, and AI-powered narrative reporting.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-in fade-in slide-in-from-bottom-16 duration-1000">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/80 text-black rounded-full px-12 py-9 text-xl font-black glow-primary transition-all hover:scale-105">
                  Launch Workbench <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="glass border-white/10 rounded-full px-12 py-9 text-xl font-bold hover:bg-white/5 transition-all">
                View Demo
              </Button>
            </div>
          </div>

          <div className="container mx-auto px-6 mt-32">
            <div className="relative glass rounded-[3.5rem] p-6 border-white/10 shadow-3xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80 z-10" />
              <img 
                src="https://picsum.photos/seed/spreadsheet88/1200/600" 
                alt="Analytical Dashboard" 
                className="rounded-[2.8rem] w-full border border-white/10 group-hover:scale-[1.02] transition-transform duration-[2000ms]"
                data-ai-hint="business dashboard"
              />
              <div className="absolute bottom-16 left-16 z-20">
                <div className="flex items-center gap-4 glass px-8 py-4 rounded-3xl border-primary/20">
                  <LayoutDashboard className="text-primary h-6 w-6" />
                  <span className="font-bold tracking-tight">Active Intelligence Workspace</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="capabilities" className="py-32 relative">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-5xl font-headline font-bold mb-6 tracking-tight">Engineered for Accuracy</h2>
                <p className="text-xl text-muted-foreground leading-relaxed">Our platform bridges the gap between raw data collection and strategic interpretation with an end-to-end automated pipeline.</p>
              </div>
              <Button variant="outline" className="rounded-full px-8 py-6 font-bold border-white/10 glass">Discover More</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { icon: Cpu, title: "Generative Narrative", desc: "Complex statistical findings translated into professional business prose automatically." },
                { icon: Database, title: "Seamless Ingestion", desc: "Industrial-grade parsing for XLSX, XLS, and CSV files with zero manual mapping required." },
                { icon: Zap, title: "Instant Validation", desc: "Automated anomaly detection and data quality scoring before you begin your analysis." },
                { icon: ShieldCheck, title: "Zero-Trust Privacy", desc: "Local-first processing ensures sensitive research data never leaves your secure context." },
                { icon: BarChart3, title: "Dynamic Visuals", desc: "Interactive distributions and trend matrices powered by our high-performance rendering core." },
                { icon: Globe, title: "Universal Export", desc: "One-click generation of high-fidelity reports including all AI narratives and visual assets." },
              ].map((feat, i) => (
                <div key={i} className="glass-card p-12 rounded-[2.5rem] border-white/5 hover:border-primary/40 transition-all duration-500 group">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-10 group-hover:bg-primary/20 transition-all duration-500 group-hover:scale-110">
                    <feat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-5 tracking-tight">{feat.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 glass">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <BarChart3 className="text-primary h-5 w-5" />
            </div>
            <span className="text-2xl font-headline font-bold tracking-tighter">AutoStat<span className="text-primary">AI</span></span>
          </div>
          <div className="flex flex-wrap justify-center gap-12 text-sm text-muted-foreground font-bold tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">SECURITY</a>
            <a href="#" className="hover:text-primary transition-colors">API</a>
            <a href="#" className="hover:text-primary transition-colors">LEGAL</a>
            <a href="#" className="hover:text-primary transition-colors">SUPPORT</a>
          </div>
          <p className="text-xs text-muted-foreground font-mono opacity-40 uppercase tracking-[0.3em]">© 2024 AUTOSTAT INTELLIGENCE SYSTEMS</p>
        </div>
      </footer>
    </div>
  );
}