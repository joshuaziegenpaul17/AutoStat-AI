import Link from 'next/link';
import { ArrowRight, BarChart3, ShieldCheck, Zap, Globe, Cpu, Database, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'data-hero');

  return (
    <div className="flex flex-col min-h-screen selection:bg-primary selection:text-black data-grid">
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <BarChart3 className="text-black h-6 w-6" />
            </div>
            <span className="text-2xl font-headline font-bold tracking-tight">AutoStat<span className="text-primary italic">AI</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#capabilities" className="text-xs font-bold hover:text-primary transition-all tracking-[0.1em] opacity-80 hover:opacity-100">CAPABILITIES</a>
            <a href="#docs" className="text-xs font-bold hover:text-primary transition-all tracking-[0.1em] opacity-80 hover:opacity-100">DOCUMENTATION</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90 text-black text-xs font-black rounded-full px-8 h-10">
                LAUNCH WORKBENCH
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="container mx-auto px-6 text-center max-w-5xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/10 text-primary text-[10px] font-black mb-8 tracking-[0.2em]">
              <Cpu className="h-3 w-3" />
              <span>STATISTICAL ENGINE v3.1 ALPHA</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-bold mb-8 leading-[0.95] tracking-tight">
              Complex Data. <span className="text-primary italic">Simplified.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-medium opacity-80">
              The professional environment for automated statistical discovery. Upload any dataset for instant cleaning, deep visual discovery, and AI-powered narrative reporting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/80 text-black rounded-full px-10 py-7 text-lg font-black transition-all hover:scale-105 shadow-xl shadow-primary/20">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="glass border-white/10 rounded-full px-10 py-7 text-lg font-bold hover:bg-white/5">
                Watch Demo
              </Button>
            </div>
          </div>

          <div className="container mx-auto px-6 mt-24">
            <div className="relative glass rounded-[2.5rem] p-4 border-white/10 overflow-hidden shadow-2xl">
              <img 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/datavis/1200/600"} 
                alt="Analytical Dashboard" 
                className="rounded-[2rem] w-full border border-white/5 opacity-80"
                data-ai-hint={heroImage?.imageHint || "data visualization"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-12">
                <div className="glass px-6 py-3 rounded-2xl border-primary/20 flex items-center gap-3">
                  <LayoutDashboard className="text-primary h-5 w-5" />
                  <span className="font-bold text-sm">Real-time Insight Workspace Active</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="capabilities" className="py-24">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Cpu, title: "Automated Interpretation", desc: "Complex statistical distributions translated into professional business prose automatically." },
                { icon: Database, title: "Industrial Ingestion", desc: "Full support for XLSX and CSV with zero manual mapping or data cleanup required." },
                { icon: Zap, title: "Anomaly Detection", desc: "Instant detection of outliers and data quality issues before analysis begins." }
              ].map((feat, i) => (
                <div key={i} className="glass-card p-10 rounded-[2rem] border-white/5 hover:border-primary/30 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-8">
                    <feat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feat.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 glass">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <BarChart3 className="text-primary h-4 w-4" />
            </div>
            <span className="text-xl font-headline font-bold tracking-tight">AutoStat<span className="text-primary">AI</span></span>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono opacity-60 uppercase tracking-[0.2em]">© 2024 AUTOSTAT SYSTEMS. ALL DATA PROCESSED SECURELY.</p>
        </div>
      </footer>
    </div>
  );
}
