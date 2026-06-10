"use client"

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Loader2, Info, ChevronRight, AlertCircle, BarChart3, LineChart, PieChart, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { parseDataset, ParsedData } from '@/lib/data-parser';
import Image from 'next/image';

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
    <div className="w-full max-w-6xl mx-auto space-y-12">
      <Card 
        className={cn(
          "relative border-0 bg-white/[0.02] rounded-[3rem] overflow-hidden group transition-all duration-500",
          isDragging ? "ring-2 ring-indigo-500 bg-indigo-500/5 scale-[1.01]" : "hover:bg-white/[0.03]",
          isProcessing && "opacity-70 cursor-not-allowed"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] -mr-40 -mt-40 rounded-full" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 blur-[100px] -ml-40 -mb-40 rounded-full" />
        </div>

        <CardContent className="relative flex flex-col lg:flex-row items-center gap-16 p-12 lg:p-20 z-10">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Analytical Workspace Ready</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9]">
                Ingest <span className="text-indigo-500">Dataset</span>
              </h2>
              <p className="text-white/50 text-lg lg:text-xl leading-relaxed font-medium max-w-xl mx-auto lg:mx-0">
                Upload a dataset to begin statistical analysis and generate insights. Analyze data, discover trends, generate forecasts, and create professional reports.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".csv, .xlsx, .xls"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                disabled={isProcessing}
              />
              <Button asChild size="lg" className="rounded-2xl px-12 h-16 text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xl shadow-indigo-600/20">
                <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-3">
                  {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
                  {isProcessing ? 'Processing Pipeline...' : 'Upload Dataset'}
                </label>
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-3 text-red-400 font-bold bg-red-500/10 px-6 py-4 rounded-2xl border border-red-500/20 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5" />
                <span className="text-xs uppercase tracking-widest">{error}</span>
              </div>
            )}
          </div>

          <div className="flex-1 w-full max-w-[500px] relative">
            <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative aspect-square rounded-[3rem] border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden p-8 shadow-2xl">
              <div className="h-full w-full rounded-2xl border border-white/5 bg-black/40 p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="h-4 w-32 rounded bg-white/5" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-end gap-2">
                    <BarChart3 className="h-8 w-8 text-indigo-500/40" />
                    <div className="h-2 w-full rounded bg-white/5" />
                    <div className="h-2 w-2/3 rounded bg-white/5" />
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-end gap-2">
                    <LineChart className="h-8 w-8 text-emerald-500/40" />
                    <div className="h-2 w-full rounded bg-white/5" />
                    <div className="h-2 w-2/3 rounded bg-white/5" />
                  </div>
                  <div className="col-span-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full border border-indigo-500/20 flex items-center justify-center">
                      <PieChart className="h-6 w-6 text-indigo-400/40" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-2 w-full rounded bg-white/5" />
                      <div className="h-2 w-1/2 rounded bg-white/5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: FileSpreadsheet, title: 'Multi-Format', desc: 'Full support for CSV and Excel files.' },
          { icon: ShieldCheck, title: 'Secure Pipeline', desc: 'Encryption-first local browser processing.' },
          { icon: BarChart3, title: 'Instant Profiling', desc: 'Automatic detection of distributions.' },
          { icon: ChevronRight, title: 'AI Integration', desc: 'Seamless transition to strategic insights.' }
        ].map((feat, idx) => (
          <div key={idx} className="bg-white/5 rounded-3xl p-8 border border-white/5 group hover:bg-white/[0.07] transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center mb-6 text-indigo-500 group-hover:scale-110 transition-transform border border-indigo-600/20">
              <feat.icon className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-3 text-white">{feat.title}</h4>
            <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase tracking-wider">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};