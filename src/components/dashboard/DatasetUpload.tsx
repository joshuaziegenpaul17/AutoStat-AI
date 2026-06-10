"use client"

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2, Info } from 'lucide-react';
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
      setError('Please upload a valid CSV or Excel file (.csv, .xlsx, .xls).');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const parsed = await parseDataset(file);
      
      if (parsed.headers.length === 0) {
        throw new Error('The file appears to be empty or missing headers.');
      }

      // AI Analysis - Handle 503/Busy errors gracefully
      let aiSuggestions = null;
      try {
        const sampleCsv = getCsvSample(parsed, 40);
        aiSuggestions = await suggestDataQualityImprovements({ csvData: sampleCsv });
      } catch (aiErr: any) {
        console.warn('AI Engine busy or unavailable. Skipping automated insights.', aiErr);
        toast({
          title: "AI Analysis Suspended",
          description: "Our AI engine is currently experiencing high demand. We'll proceed with standard visualization.",
          variant: "default"
        });
      }

      onUpload(parsed, aiSuggestions);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Critical failure during dataset ingestion.');
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
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <Card 
        className={cn(
          "relative border-dashed border-2 transition-all duration-500 glass overflow-hidden rounded-[2.5rem]",
          isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-white/10",
          isProcessing && "opacity-70 cursor-not-allowed"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-28 text-center">
          <div className="mb-10 p-6 rounded-[2rem] bg-primary/10 border border-primary/20 glow-primary">
            <Upload className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-5xl font-headline font-bold mb-4 tracking-tighter">Automated Intelligence</h2>
          <p className="text-muted-foreground mb-12 max-w-lg text-lg leading-relaxed">
            Drop your CSV or Excel dataset. Our engine handles the mapping, type detection, and statistical baseline generation instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-5">
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              accept=".csv, .xlsx, .xls"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              disabled={isProcessing}
            />
            <Button asChild size="lg" className="rounded-full px-14 py-8 text-lg bg-primary hover:bg-primary/90 text-black font-black transition-all hover:translate-y-[-2px] shadow-xl shadow-primary/10">
              <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-3">
                {isProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : null}
                {isProcessing ? 'SYNCHRONIZING...' : 'UPLOAD DATA SOURCE'}
              </label>
            </Button>
          </div>

          {error && (
            <div className="mt-12 flex items-center gap-4 text-destructive font-bold bg-destructive/10 px-8 py-5 rounded-2xl border border-destructive/20 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="h-6 w-6" />
              <span className="text-sm uppercase tracking-widest">{error}</span>
            </div>
          )}
        </CardContent>

        {isProcessing && (
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/5">
            <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }} />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: FileSpreadsheet, title: 'Multi-Format', desc: 'Industry-standard support for XLS, XLSX, and CSV.' },
          { icon: Info, title: 'Resilient Pipeline', desc: 'Visualization remains active even during AI service spikes.' },
          { icon: FileText, title: 'Instant Stat-Report', desc: 'Immediate descriptive analysis on any numeric vector.' }
        ].map((feat, idx) => (
          <div key={idx} className="glass rounded-[2rem] p-10 border-white/5 flex flex-col gap-5 items-center text-center hover:border-primary/20 transition-all group">
            <div className="p-4 rounded-2xl bg-white/5 text-primary group-hover:bg-primary/10 transition-colors">
              <feat.icon className="h-7 w-7" />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 uppercase tracking-tight">{feat.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};