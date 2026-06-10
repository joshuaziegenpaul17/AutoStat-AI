import Link from 'next/link';
import { BarChart3, ArrowRight, ShieldCheck, Database, LineChart, FileText, PieChart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const statusItems = [
    "ENCRYPTION: AES-256 ACTIVE",
    "DATA PRIVACY: SECURE",
    "ANALYTICS ENGINE: READY",
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
            <span className="text-lg font-bold tracking-tight text-white uppercase tracking-tighter">AutoStat AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            <Link href="/dashboard" className="hover:text-white transition-colors">Workspace</Link>
            <Link href="/security" className="hover:text-white transition-colors">Security</Link>
            <Link href="/resources" className="hover:text-white transition-colors">Documentation</Link>
          </nav>
          <Link href="/dashboard">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 font-bold text-[10px] uppercase tracking-widest">
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-bold mb-8 uppercase tracking-widest">
              <ShieldCheck className="h-3 w-3" />
              <span>Professional Analytics Platform</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black mb-8 leading-[0.85] tracking-tighter uppercase">
              Automated <br />
              <span className="text-indigo-500">Analytics</span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Transform raw data into professional executive insights instantly. AutoStat AI provides automated statistical profiling, forecasting, and business intelligence for enterprise datasets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-12 h-16 text-xs uppercase tracking-widest font-bold group shadow-xl shadow-indigo-600/20">
                  Get Started <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                <span className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Why AutoStat AI Section */}
        <section className="py-32 container mx-auto px-6">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Why AutoStat AI?</h2>
            <p className="text-white/40 max-w-xl mx-auto font-medium">An integrated analytical ecosystem designed for speed, accuracy, and strategic insight.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: Zap, 
                title: 'Instant Profiling', 
                desc: 'Automatic detection of feature distributions, types, and structural health upon ingestion.' 
              },
              { 
                icon: BarChart3, 
                title: 'Statistical Modeling', 
                desc: 'Deep descriptive statistics including variance, kurtosis, and correlation mapping.' 
              },
              { 
                icon: LineChart, 
                title: 'Trend Forecasting', 
                desc: 'Predictive temporal modeling to identify sequential trends and future trajectories.' 
              },
              { 
                icon: PieChart, 
                title: 'Visual Discovery', 
                desc: 'Interactive visualizations including heatmaps, histograms, and composition charts.' 
              }
            ].map((feature, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center mb-8 border border-indigo-600/20 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-indigo-500 h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-4 tracking-tight uppercase">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-32 bg-white/[0.01] border-y border-white/5">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-10">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">AI-Powered <br /><span className="text-indigo-500">Insights</span></h2>
                <p className="text-lg text-white/50 leading-relaxed font-medium">
                  Our advanced analytical engine synthesizes statistical data into high-fidelity executive reports. Gain clarity on business opportunities, risk vectors, and strategic recommendations without manual data crunching.
                </p>
                <div className="space-y-6">
                  {[
                    "Automated Executive Summaries",
                    "Anomaly and Outlier Detection",
                    "Feature Relationship Analysis",
                    "Actionable Growth Recommendations"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-indigo-400">
                      <ShieldCheck className="h-4 w-4" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-10 bg-indigo-600/20 blur-[100px] rounded-full" />
                <div className="relative rounded-[3rem] border border-white/10 bg-zinc-900 p-8 shadow-2xl">
                  <div className="aspect-video bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-600/20">
                    <BarChart3 className="h-24 w-24 text-indigo-500/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 bg-black">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 opacity-60">
              <BarChart3 className="h-6 w-6" />
              <span className="font-bold text-xl tracking-tighter uppercase italic">AutoStat AI</span>
            </div>
            <p className="text-[10px] text-white/20 max-w-sm leading-relaxed font-medium">
              AutoStat AI is a data analytics and reporting platform designed to assist users in exploring and understanding datasets through statistical analysis, forecasting, visualization, and AI-assisted insights.
            </p>
          </div>
          <div className="flex flex-wrap gap-12 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
            <div className="flex flex-col gap-5">
              <p className="text-indigo-500 tracking-[0.4em]">Platform</p>
              <Link href="/dashboard" className="hover:text-white transition-colors">Workspace</Link>
              <Link href="/security" className="hover:text-white transition-colors">Security Center</Link>
              <Link href="/resources" className="hover:text-white transition-colors">Documentation</Link>
            </div>
            <div className="flex flex-col gap-5">
              <p className="text-indigo-500 tracking-[0.4em]">Legal</p>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
              <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
            </div>
          </div>
          <div className="space-y-2 md:text-right">
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
