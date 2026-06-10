
"use client"

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Loader2, BarChart3, LineChart, PieChart, ShieldCheck, AlertCircle, TrendingUp, Target, Activity, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { parseDataset, ParsedData } from '@/lib/data-parser';
import { Badge } from '@/components/ui/badge';

interface DatasetUploadProps {
  onUpload: (data: ParsedData) => void;
}

export const DatasetUpload: React.FC<DatasetUploadProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
              <BarChart3 className="h-4 w-4" />
              <span>Analytical Workspace Active</span>
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

          {/* Premium Hero Visualization Mockup */}
          <div className="flex-1 w-full max-w-[650px] relative perspective-1000">
            <div className="absolute -inset-10 bg-indigo-600/20 blur-[100px] rounded-full opacity-40 animate-pulse" />
            <div className="relative transform lg:rotate-y-[-10deg] lg:rotate-x-[5deg] transition-transform duration-1000 group-hover:rotate-0">
              <div className="rounded-[3rem] border border-white/10 bg-zinc-950/80 backdrop-blur-3xl overflow-hidden p-1 shadow-2xl shadow-black/50">
                <div className="bg-black/40 p-10 space-y-8 h-[550px]">
                  {/* Mockup Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-red-500/30" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/30" />
                    </div>
                    <Badge variant="outline" className="border-indigo-500/20 text-indigo-500 text-[9px] font-black tracking-widest uppercase">
                      Operational Status
                    </Badge>
                  </div>

                  {/* Mockup KPI Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Forecast Accuracy</span>
                        <Target className="h-3.5 w-3.5 text-indigo-500/40" />
                      </div>
                      <p className="text-2xl font-black text-white tracking-tighter">98.4%</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Data Quality</span>
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/40" />
                      </div>
                      <p className="text-2xl font-black text-white tracking-tighter">A+</p>
                    </div>
                  </div>

                  {/* Mockup Chart Visualization */}
                  <div className="bg-white/5 border border-white/5 rounded-3xl p-6 flex-1 h-full relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Correlation Analysis</span>
                      <TrendingUp className="h-4 w-4 text-indigo-500" />
                    </div>
                    
                    {/* Simulated Correlation Bars */}
                    <div className="flex items-end gap-3 h-32 mb-10">
                      {[60, 85, 45, 95, 70, 50, 80, 40].map((h, i) => (
                        <div key={i} className="flex-1 bg-indigo-500/10 border-t-2 border-indigo-500/40 rounded-t-lg transition-all" style={{ height: `${h}%` }} />
                      ))}
                    </div>

                    {/* AI Insight Overlay */}
                    <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-5 backdrop-blur-md">
                      <div className="flex items-center gap-3 mb-3">
                        <Activity className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">AI Insights</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-full rounded bg-white/10" />
                        <div className="h-2 w-2/3 rounded bg-white/10" />
                      </div>
                    </div>
                  </div>
                </div>
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
          { icon: Target, title: 'Predictive Analytics', desc: 'Trend modeling and trajectory forecasts.' }
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
