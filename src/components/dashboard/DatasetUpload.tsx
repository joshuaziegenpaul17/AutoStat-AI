"use client"

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';
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

      // Get AI suggestions for the data quality using a CSV sample
      const sampleCsv = getCsvSample(parsed, 50);
      const aiSuggestions = await suggestDataQualityImprovements({ csvData: sampleCsv });

      onUpload(parsed, aiSuggestions);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process the dataset. Ensure the file is not corrupted and contains data.');
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card 
        className={cn(
          "relative border-dashed border-2 transition-all duration-300 glass overflow-hidden",
          isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-white/10",
          isProcessing && "opacity-60 cursor-not-allowed"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 p-4 rounded-2xl bg-primary/10 ring-1 ring-primary/20 glow-primary">
            <Upload className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-headline font-bold mb-2">Initialize Data Pipeline</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Drag and drop your CSV or Excel dataset here to begin automated statistical extraction and AI-driven insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              accept=".csv, .xlsx, .xls"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              disabled={isProcessing}
            />
            <Button asChild size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white font-bold">
              <label htmlFor="file-upload" className="cursor-pointer">
                {isProcessing ? 'Analyzing...' : 'Upload Dataset'}
              </label>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 glass border-white/10 hover:bg-white/5">
              Documentation
            </Button>
          </div>

          {error && (
            <div className="mt-8 flex items-center gap-3 text-destructive font-medium bg-destructive/10 px-6 py-3 rounded-xl border border-destructive/20 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </CardContent>

        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
          {isProcessing && <div className="h-full bg-primary animate-pulse transition-all duration-500" style={{ width: '70%' }} />}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: FileSpreadsheet, title: 'Multi-Format', desc: 'Native support for Excel (.xlsx) and CSV datasets.' },
          { icon: CheckCircle2, title: 'Deep Validation', desc: 'AI-assisted data validation and anomaly detection.' },
          { icon: FileText, title: 'Instant Reports', desc: 'Generate professional interpretations automatically.' }
        ].map((feat, idx) => (
          <div key={idx} className="glass rounded-2xl p-6 border-white/5 flex gap-4 items-start hover:bg-white/[0.05] transition-colors">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <feat.icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">{feat.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};