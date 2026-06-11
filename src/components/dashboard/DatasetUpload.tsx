
"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { Upload, FileSpreadsheet, Loader2, BarChart3, ShieldCheck, AlertCircle, Database, TrendingUp, Zap, Target, Activity, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { parseDataset, ParsedData } from '@/lib/data-parser';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface DatasetUploadProps {
  onUpload: (data: ParsedData) => void;
}

const DashboardMockup = () => (
  <div className="w-full h-full p-6 space-y-4 bg-zinc-950/90 text-white/90 overflow-hidden select-none pointer-events-none">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
          <BarChart3 className="h-4 w-4 text-white" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Analytical Report</span>
      </div>
      <div className="flex gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Live Engine</span>
      </div>
    </div>

    {/* KPI Grid */}
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: 'Reliability', val: '98.4%', color: 'text-indigo-400' },
        { label: 'Correlation', val: '0.82', color: 'text-emerald-400' }
      ].map((stat, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
          <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{stat.label}</p>
          <p className={cn("text-lg font-black tracking-tighter", stat.color)}>{stat.val}</p>
        </div>
      ))}
    </div>

    {/* Charts Mockup */}
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4 h-48 relative">
      <div className="flex justify-between items-end h-32 gap-1 px-2">
        {[40, 70, 45, 90, 65, 80, 55, 30, 85, 60, 40, 75].map((h, i) => (
          <div 
            key={i} 
            className="w-full bg-indigo-500/40 rounded-t-sm transition-all duration-1000" 
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[8px] font-bold text-white/20 uppercase tracking-tighter">
        <span>Q1 Forecast</span>
        <span>Target Variance</span>
      </div>
    </div>

    {/* AI Insight Block */}
    <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-4 space-y-3 relative group">
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-4 w-4 text-indigo-400" />
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-300">Executive Analysis</span>
      </div>
      <p className="text-[10px] leading-relaxed text-white/60 font-medium">
        Standardizing feature vectors has identified a strong positive correlation between throughput and systemic efficiency. Recommended trajectory is upward for Q3.
      </p>
      <div className="flex gap-2">
        <div className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[7px] font-black uppercase tracking-widest text-indigo-400">Low Risk</div>
        <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[7px] font-black uppercase tracking-widest text-emerald-400">Verified</div>
      </div>
    </div>

    {/* Mini Heatmap Grid */}
    <div className="grid grid-cols-4 gap-1">
      {Array.from({ length: 12 }).map((_, i) => (
        <div 
          key={i} 
          className="aspect-square rounded-sm border border-white/5" 
          style={{ backgroundColor: `rgba(99, 102, 241, ${Math.random() * 0.4})` }}
        />
      ))}
    </div>
  </div>
);

export const DatasetUpload: React.FC<DatasetUploadProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heroImage = PlaceHolderImages.find(img => img.id === 'dashboard-hero');

  const handleFile = async (file: File) => {
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isAllowed) {
      setError('Invalid file format. Please use CSV or Excel.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const parsed = await parseDataset(file);
      if (parsed.headers.length === 0) throw new Error('File is empty or missing headers.');
      onUpload(parsed);
    } catch (err: any) {
      setError(err.message || 'Failed to process dataset.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <Card 
        className={cn(
          "relative border-0 bg-white/[0.01] rounded-[4rem] overflow-hidden group transition-all duration-700",
          isDragging ? "ring-2 ring-indigo-500 bg-indigo-500/5 scale-[1.01]" : "hover:bg-white/[0.02]",
          isProcessing && "opacity-70 cursor-not-allowed"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] -mr-40 -mt-40 rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] -ml-40 -mb-40 rounded-full" />
        </div>

        <CardContent className="relative flex flex-col lg:flex-row items-center gap-16 p-12 lg:p-24 z-10">
          <div className="flex-1 space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-black uppercase tracking-[0.2em]">
              <Zap className="h-4 w-4" />
              <span>Workspace Initialized</span>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-5xl lg:text-8xl font-black tracking-tighter text-white uppercase leading-[0.85]">
                Ingest <br /><span className="text-indigo-500">Datasets</span>
              </h2>
              <p className="text-white/40 text-lg lg:text-2xl leading-relaxed font-medium max-w-xl mx-auto lg:mx-0">
                Upload your raw data to unlock automated statistical profiling, predictive forecasting, and strategic AI insights.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4">
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".csv, .xlsx, .xls"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                disabled={isProcessing}
              />
              <Button asChild size="lg" className="rounded-2xl px-14 h-20 text-xs uppercase tracking-[0.2em] bg-indigo-600 hover:bg-indigo-700 text-white font-black transition-all shadow-2xl shadow-indigo-600/30">
                <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-4">
                  {isProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : <Upload className="h-5 w-5" />}
                  {isProcessing ? 'Processing Data...' : 'Start Analysis'}
                </label>
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-4 text-red-400 font-bold bg-red-500/10 px-8 py-5 rounded-[2rem] border border-red-500/20 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="h-6 w-6" />
                <span className="text-xs uppercase tracking-widest">{error}</span>
              </div>
            )}
          </div>

          {/* Premium Product Showcase Visualization */}
          <div className="flex-1 w-full max-w-[650px] relative perspective-1000">
            <div className="absolute -inset-10 bg-indigo-600/20 blur-[100px] rounded-full opacity-40 animate-pulse" />
            <div className="relative transform lg:rotate-y-[-10deg] lg:rotate-x-[5deg] transition-transform duration-1000 group-hover:rotate-0">
              <div className="rounded-[3rem] border border-white/10 bg-zinc-950/80 backdrop-blur-3xl overflow-hidden shadow-2xl shadow-black/50 aspect-[4/5] relative">
                {/* Live Mockup always renders if image fails or before it loads */}
                <DashboardMockup />
                
                {/* Hero Image Overlay */}
                {heroImage && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                    <Image 
                      src={heroImage.imageUrl} 
                      alt={heroImage.description} 
                      fill 
                      className="object-cover"
                      data-ai-hint={heroImage.imageHint}
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust & Capability Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { icon: FileSpreadsheet, title: 'Multi-Format', desc: 'Secure ingestion for CSV and Excel files.' },
          { icon: ShieldCheck, title: 'Privacy Focused', desc: 'Client-side processing environment.' },
          { icon: Database, title: 'Data Profiling', desc: 'Automatic feature distribution analysis.' },
          { icon: BrainCircuit, title: 'AI Insights', desc: 'Automated strategic report generation.' }
        ].map((feat, idx) => (
          <div key={idx} className="bg-white/5 rounded-[2.5rem] p-10 border border-white/5 group hover:bg-white/[0.08] transition-all duration-500">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center mb-8 text-indigo-500 group-hover:scale-110 transition-transform border border-indigo-600/20">
              <feat.icon className="h-6 w-6" />
            </div>
            <h4 className="font-black text-sm uppercase tracking-[0.2em] mb-4 text-white">{feat.title}</h4>
            <p className="text-[11px] text-white/30 leading-relaxed font-bold uppercase tracking-wider">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
