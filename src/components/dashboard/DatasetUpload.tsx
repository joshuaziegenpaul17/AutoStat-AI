"use client"

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2, Info, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { parseDataset, ParsedData, getCsvSample } from '@/lib/data-parser';
import { suggestDataQualityImprovements } from '@/ai/flows/data-quality-suggester';
import { useToast } from '@/hooks/use-toast';

interface DatasetUploadProps {
  onUpload: (data: ParsedData, aiSuggestions: any) => void;
}

export const DatasetUpload: React.FC<DatasetUploadProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isAllowed) {
      setError('Invalid mission data format. Use CSV or Excel.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const parsed = await parseDataset(file);
      
      if (parsed.headers.length === 0) {
        throw new Error('Mission data empty or missing headers.');
      }

      let aiSuggestions = null;
      try {
        const sampleCsv = getCsvSample(parsed, 40);
        aiSuggestions = await suggestDataQualityImprovements({ csvData: sampleCsv });
      } catch (aiErr: any) {
        console.warn('AI Engine busy. Proceeding with standard ingestion.', aiErr);
        toast({
          title: "Diagnostic Cluster Busy",
          description: "Proceeding with standard ingestion. Diagnostics available post-load.",
          variant: "default"
        });
      }

      onUpload(parsed, aiSuggestions);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Critical failure during ingestion.');
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
    <div className="w-full max-w-5xl mx-auto space-y-12">
      <Card 
        className={cn(
          "relative border-dashed border-2 transition-all duration-700 glass overflow-hidden rounded-[4rem] group",
          isDragging ? "border-primary bg-primary/10 scale-[1.02]" : "border-white/10",
          isProcessing && "opacity-70 cursor-not-allowed"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-transform duration-1000 group-hover:scale-110">
          <FileSpreadsheet className="h-64 w-64 text-primary" />
        </div>
        
        <CardContent className="flex flex-col items-center justify-center py-32 text-center relative z-10">
          <div className="mb-12 p-8 rounded-[2.5rem] bg-primary/10 border border-primary/20 glow-primary transition-transform group-hover:rotate-12">
            <Upload className="h-12 w-12 text-primary" />
          </div>
          
          <h2 className="text-6xl font-headline font-black mb-6 tracking-tighter text-white">
            Ingest Mission Data
          </h2>
          
          <p className="text-white/40 mb-16 max-w-xl text-xl leading-relaxed">
            Drop your CSV or Excel dataset. Our statistical pipeline handles mapping and quality validation in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              accept=".csv, .xlsx, .xls"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              disabled={isProcessing}
            />
            <Button asChild size="lg" className="rounded-full px-16 h-24 text-xl bg-primary hover:bg-primary/90 text-black font-black transition-all hover:translate-y-[-4px] shadow-2xl shadow-primary/20">
              <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-4">
                {isProcessing ? <Loader2 className="animate-spin h-6 w-6" /> : null}
                {isProcessing ? 'SYNCHRONIZING...' : 'UPLOAD DATA SOURCE'}
              </label>
            </Button>
          </div>

          {error && (
            <div className="mt-16 flex items-center gap-4 text-destructive font-black bg-destructive/10 px-10 py-6 rounded-3xl border border-destructive/20 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="h-7 w-7" />
              <span className="text-sm uppercase tracking-[0.3em]">{error}</span>
            </div>
          )}
        </CardContent>

        {isProcessing && (
          <div className="absolute bottom-0 left-0 w-full h-2 bg-white/5">
            <div className="h-full bg-primary animate-[shimmer_2s_infinite]" style={{ width: '100%' }} />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { icon: FileSpreadsheet, title: 'Multi-Format', desc: 'Enterprise support for XLS, XLSX, and CSV vectors.' },
          { icon: Info, title: 'Resilient Pipeline', desc: 'Real-time ingestion stable during AI service spikes.' },
          { icon: FileText, title: 'Instant Synthesis', desc: 'Immediate statistical descriptive mapping on load.' }
        ].map((feat, idx) => (
          <div key={idx} className="glass rounded-[3rem] p-12 border-white/5 flex flex-col gap-6 items-center text-center hover:border-primary/20 transition-all group">
            <div className="p-5 rounded-2xl bg-white/5 text-primary group-hover:bg-primary/10 transition-colors border border-white/5">
              <feat.icon className="h-8 w-8" />
            </div>
            <div>
              <h4 className="font-black text-xl mb-4 text-white uppercase tracking-tight">{feat.title}</h4>
              <p className="text-sm text-white/40 leading-relaxed font-medium">{feat.desc}</p>
            </div>
            <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mt-4">
              Details <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};