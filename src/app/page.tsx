
import Link from 'next/link';
import { ArrowRight, BarChart3, ShieldCheck, Zap, Globe, Cpu, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
              <BarChart3 className="text-white h-6 w-6" />
            </div>
            <span className="text-2xl font-headline font-bold tracking-tight">AutoStat<span className="text-primary">AI</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#solutions" className="text-sm font-medium hover:text-primary transition-colors">Solutions</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-sm font-medium">Log in</Button>
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90 text-sm font-bold rounded-full px-6">
                Start Free Analysis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10" />
          <div className="container mx-auto px-6 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-accent text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Zap className="h-3 w-3 fill-accent" />
              <span>POWERED BY GENKIT & NEXT.JS 15</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-bold mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000">
              The Intelligent Way to <span className="text-primary italic">Analyze</span> Data.
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
              AutoStat AI automates your entire statistical workflow. From CSV cleaning to professional reports and AI-driven interpretations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-16 duration-1000">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-10 py-7 text-lg font-bold glow-primary">
                  Launch Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="glass border-white/10 rounded-full px-10 py-7 text-lg font-bold hover:bg-white/5">
                Watch Demo
              </Button>
            </div>
          </div>

          <div className="container mx-auto px-6 mt-24">
            <div className="relative glass rounded-3xl p-4 border-white/5 shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-50 z-10" />
              <img 
                src="https://picsum.photos/seed/autostat-hero/1200/600" 
                alt="Dashboard Preview" 
                className="rounded-2xl w-full border border-white/5 group-hover:scale-[1.01] transition-transform duration-1000"
                data-ai-hint="data dashboard"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white/[0.02]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-headline font-bold mb-4">Unmatched Statistical Intelligence</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to transform raw numbers into boardroom-ready insights.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Cpu, title: "AI Narratives", desc: "Get professional textual interpretations for every chart and statistical test." },
                { icon: Database, title: "Robust CSV Core", desc: "Automated cleaning, type detection, and validation for complex datasets." },
                { icon: Zap, title: "Hypothesis Testing", desc: "Execute T-tests, ANOVA, and Regression models with a few clicks." },
                { icon: ShieldCheck, title: "Privacy First", desc: "Your data is encrypted and processed with zero-retention policies." },
                { icon: BarChart3, title: "High-Fi Visuals", desc: "Stunning Recharts integration for histograms, boxplots, and heatmaps." },
                { icon: Globe, title: "Export Anywhere", desc: "Generate professional PDF reports including interpretations and visuals." },
              ].map((feat, i) => (
                <div key={i} className="glass-card p-8 rounded-2xl border-white/5 hover:border-primary/20 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                    <feat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 glass">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="text-white h-4 w-4" />
            </div>
            <span className="text-lg font-headline font-bold">AutoStat<span className="text-primary">AI</span></span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Security</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground">© 2024 AutoStat AI Inc. Built with Passion & Data.</p>
        </div>
      </footer>
    </div>
  );
}
