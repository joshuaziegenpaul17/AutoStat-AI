
"use client"

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Loader2, ShieldCheck, AlertCircle, Database, Zap, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { parseDataset, ParsedData } from '@/lib/data-parser';

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

        <CardContent className="relative flex flex-col items-center text-center p-12 lg:p-24 z-10">
          <div className="max-w-4xl space-y-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-black uppercase tracking-[0.2em]">
              <Zap className="h-4 w-4" />
              <span>Workspace Initialized</span>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-5xl lg:text-8xl font-black tracking-tighter text-white uppercase leading-[0.85]">
                Ingest <br /><span className="text-indigo-500">Datasets</span>
              </h2>
              <p className="text-white/40 text-lg lg:text-2xl leading-relaxed font-medium max-w-2xl mx-auto">
                Upload your raw data to unlock automated statistical profiling, predictive forecasting, and strategic AI insights.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
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
              <div className="flex items-center gap-4 text-red-400 font-bold bg-red-500/10 px-8 py-5 rounded-[2rem] border border-red-500/20 animate-in fade-in slide-in-from-top-4 mx-auto max-w-md">
                <AlertCircle className="h-6 w-6" />
                <span className="text-xs uppercase tracking-widest">{error}</span>
              </div>
            )}
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
