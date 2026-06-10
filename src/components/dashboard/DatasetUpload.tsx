"use client"

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { parseDataset, ParsedData, getCsvSample } from '@/lib/data-parser';
import { suggestDataQualityImprovements } from '@/ai/flows/data-quality-suggester';

interface DatasetUploadProps {
  onUpload: (data: ParsedData, aiSuggestions: any) => void;
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

      // Attempt AI suggestions, but don't crash if Gemini is busy
      let aiSuggestions = null;
      try {
        const sampleCsv = getCsvSample(parsed, 50);
        aiSuggestions = await suggestDataQualityImprovements({ csvData: sampleCsv });
      } catch (aiErr) {
        console.warn('AI Insights temporarily unavailable:', aiErr);
        // We continue anyway so the user can see their data
      }

      onUpload(parsed, aiSuggestions);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during processing.');
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
          "relative border-dashed border-2 transition-all duration-500 glass overflow-hidden rounded-[2rem]",
          isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-white/10",
          isProcessing && "opacity-70 cursor-not-allowed"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-8 p-5 rounded-3xl bg-primary/10 ring-1 ring-primary/30 glow-primary animate-pulse">
            <Upload className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-4xl font-headline font-bold mb-4 tracking-tight">Ingest Intelligence</h2>
          <p className="text-muted-foreground mb-10 max-w-lg text-lg leading-relaxed">
            Upload your CSV or Excel dataset. Our engine will automatically validate, visualize, and prepare AI narratives.
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
            <Button asChild size="lg" className="rounded-full px-12 py-7 text-lg bg-primary hover:bg-primary/80 text-black font-bold transition-all hover:scale-105">
              <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2">
                {isProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : null}
                {isProcessing ? 'Processing...' : 'Upload Data Source'}
              </label>
            </Button>
          </div>

          {error && (
            <div className="mt-10 flex items-center gap-4 text-destructive font-medium bg-destructive/5 px-8 py-4 rounded-2xl border border-destructive/20 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="h-6 w-6" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </CardContent>

        {isProcessing && (
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/5">
            <div className="h-full bg-primary animate-progress-loading" style={{ width: '40%' }} />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: FileSpreadsheet, title: 'Multi-Format', desc: 'Native processing for XLSX, XLS, and CSV datasets.' },
          { icon: CheckCircle2, title: 'Deep Validation', desc: 'Automatic type detection and anomaly scanning.' },
          { icon: FileText, title: 'Instant Narrative', desc: 'Generative insights explaining your data trends.' }
        ].map((feat, idx) => (
          <div key={idx} className="glass rounded-[2rem] p-8 border-white/5 flex flex-col gap-4 items-center text-center hover:bg-white/[0.04] transition-all duration-300">
            <div className="p-4 rounded-2xl bg-primary/5 text-primary">
              <feat.icon className="h-7 w-7" />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">{feat.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};