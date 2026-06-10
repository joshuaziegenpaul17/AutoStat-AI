import Link from 'next/link';
import { ArrowRight, BarChart3, ShieldCheck, Zap, Globe, Cpu, Database, LayoutDashboard, Layers, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'data-hero');

  return (
    <div className="flex flex-col min-h-screen mesh-gradient data-grid overflow-x-hidden bg-background">
      <header className="sticky top-0 z-50 glass border-b border-white/5 h-20">
        <div className="container mx-auto px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-transform group-hover:rotate-12">
              <BarChart3 className="text-primary-foreground h-6 w-6" />
            </div>
            <span className="text-2xl font-headline font-bold tracking-tight text-white">
              AutoStat<span className="text-primary italic">AI</span>
            </span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-10">
            {['Capabilities', 'Intelligence', 'Enterprise', 'Docs'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black rounded-full px-8 h-12 shadow-lg shadow-primary/20 transition-all hover:scale-105">
                LAUNCH WORKBENCH
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative pt-32 pb-40">
          <div className="container mx-auto px-8 text-center max-w-6xl relative z-10">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border-primary/20 text-primary text-[10px] font-black mb-12 tracking-[0.3em] animate-pulse">
              <Cpu className="h-3.5 w-3.5" />
              <span>STATISTICAL ENGINE v4.0 PLATINUM</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-headline font-black mb-10 leading-[0.85] tracking-tighter text-white">
              Symmetry <br />
              <span className="text-primary italic glow-text">In Chaos.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/50 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
              A high-fidelity analytical architecture designed to synthesize raw datasets into strategic intelligence. Professional-grade modeling for modern decision-makers.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-full px-16 py-10 text-xl font-black transition-all hover:translate-y-[-4px] shadow-2xl shadow-primary/30">
                  Enter Workspace <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="container mx-auto px-8 mt-32 relative">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[120%] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative glass rounded-[4rem] p-6 border-white/10 overflow-hidden shadow-[0_0_100px_-20px_rgba(139,92,246,0.2)] group">
              <img 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/datavis/1200/600"} 
                alt="Analytical Dashboard" 
                className="rounded-[3rem] w-full border border-white/5 opacity-80 grayscale-[30%] transition-all duration-1000 group-hover:scale-[1.01] group-hover:grayscale-0"
                data-ai-hint={heroImage?.imageHint || "data visualization"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent flex flex-col justify-end p-16">
                 <div className="flex items-center gap-6">
                    <div className="glass px-8 py-4 rounded-[2rem] border-primary/30 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-8">
                      <LayoutDashboard className="text-primary h-6 w-6" />
                      <span className="font-black text-sm uppercase tracking-widest text-white">Interface Active</span>
                    </div>
                    <div className="glass px-8 py-4 rounded-[2rem] border-white/10 flex items-center gap-4 backdrop-blur-md">
                      <Layers className="text-white/40 h-6 w-6" />
                      <span className="font-bold text-sm text-white/40">Multi-Vector Processing</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <section id="capabilities" className="py-40 relative">
          <div className="container mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { 
                  icon: Cpu, 
                  title: "Predictive Synthesis", 
                  desc: "Neural distributions mapped to executive strategy. Temporal projection for mission-critical paths." 
                },
                { 
                  icon: Database, 
                  title: "Industrial Ingestion", 
                  desc: "Unified support for complex Excel and CSV payloads. Automated schema alignment." 
                },
                { 
                  icon: Zap, 
                  title: "Structural Diagnostics", 
                  desc: "Identify data-drift and structural anomalies before they impact your analytical integrity." 
                }
              ].map((feat, i) => (
                <div key={i} className="glass-card p-12 rounded-[3rem] group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <feat.icon className="h-32 w-32 text-primary" />
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-10 border border-primary/20">
                    <feat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-black mb-6 text-white tracking-tight">{feat.title}</h3>
                  <p className="text-white/40 text-lg leading-relaxed">{feat.desc}</p>
                  <div className="mt-10 flex items-center gap-3 text-primary font-black text-xs uppercase tracking-widest cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    View Specs <MousePointer2 className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 glass">
        <div className="container mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <BarChart3 className="text-primary h-6 w-6" />
            </div>
            <span className="text-2xl font-headline font-black tracking-tight text-white">AutoStat<span className="text-primary">AI</span></span>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-4">
            <p className="text-[11px] text-white/20 font-black uppercase tracking-[0.4em]">© 2024 AUTOSTAT SYSTEMS • DESIGNED FOR DISCOVERY</p>
            <div className="flex gap-8">
              {['Privacy', 'Network', 'Legal'].map(item => (
                <a key={item} href="#" className="text-[10px] font-bold text-white/40 hover:text-primary transition-colors uppercase tracking-widest">{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}