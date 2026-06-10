
"use client"

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
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
    const isAllowed = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isAllowed) {
      setError('Please upload a valid CSV or Excel file.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const parsed = await parseDataset(file);
      
      // Get AI suggestions for the data quality using a CSV sample
      const sampleCsv = getCsvSample(parsed, 100);
      const aiSuggestions = await suggestDataQualityImprovements({ csvData: sampleCsv });

      onUpload(parsed, aiSuggestions);
    } catch (err) {
      console.error(err);
      setError('Failed to process the dataset. Ensure it is a valid CSV or Excel format.');
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
          isDragging ? "border-primary bg-primary/10 scale-[1.01]" : "border-white/10",
          isProcessing && "opacity-60 cursor-not-allowed"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 p-4 rounded-full bg-primary/10 ring-1 ring-primary/20 glow-primary">
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
            <Button asChild size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90">
              <label htmlFor="file-upload" className="cursor-pointer">
                {isProcessing ? 'Processing...' : 'Browse Files'}
              </label>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 glass border-white/10 hover:bg-white/5">
              View Sample Data
            </Button>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 text-destructive font-medium bg-destructive/10 px-4 py-2 rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>

        <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20">
          {isProcessing && <div className="h-full bg-primary animate-pulse w-1/2" />}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: FileText, title: 'CSV & Excel', desc: 'Full support for CSV and Microsoft Excel formats.' },
          { icon: CheckCircle2, title: 'Auto-Cleaning', desc: 'AI-assisted data validation and outlier detection.' },
          { icon: Upload, title: 'Safe Storage', desc: 'Secure encryption for all your uploaded research data.' }
        ].map((feat, idx) => (
          <div key={idx} className="glass rounded-xl p-5 border-white/5 flex gap-4 items-start">
            <div className="p-2 rounded-lg bg-white/5 text-accent">
              <feat.icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">{feat.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
