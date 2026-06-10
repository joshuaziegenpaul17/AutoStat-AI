"use client"

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Loader2, Info, ChevronRight, AlertCircle } from 'lucide-react';
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
    <div className="w-full max-w-4xl mx-auto">
      <Card 
        className={cn(
          "relative border-dashed border-2 transition-all duration-300 bg-white/[0.02] border-white/10 rounded-[2.5rem] overflow-hidden group",
          isDragging ? "border-indigo-500 bg-indigo-500/5 scale-[1.01]" : "hover:border-white/20",
          isProcessing && "opacity-70 cursor-not-allowed"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-8 p-6 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-500 transition-transform group-hover:scale-110">
            <Upload className="h-10 w-10" />
          </div>
          
          <h2 className="text-4xl font-bold mb-4 tracking-tight text-white">Ingest Dataset</h2>
          <p className="text-white/40 mb-12 max-w-md text-lg leading-relaxed">
            Upload your CSV or Excel file to initiate automatic statistical profiling and visualization.
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
            <Button asChild size="lg" className="rounded-xl px-12 h-16 text-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xl shadow-indigo-600/20">
              <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-3">
                {isProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : null}
                {isProcessing ? 'Processing...' : 'Choose File'}
              </label>
            </Button>
          </div>

          {error && (
            <div className="mt-8 flex items-center gap-3 text-red-400 font-bold bg-red-500/10 px-6 py-4 rounded-xl border border-red-500/20">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm uppercase tracking-widest">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {[
          { icon: FileSpreadsheet, title: 'Multi-Format', desc: 'Full support for CSV and Excel files.' },
          { icon: Info, title: 'Secure Pipeline', desc: 'All processing occurs locally in your browser.' },
          { icon: ChevronRight, title: 'Instant Stats', desc: 'Generate reports within seconds of upload.' }
        ].map((feat, idx) => (
          <div key={idx} className="bg-white/5 rounded-2xl p-8 border border-white/5 text-center group hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center mx-auto mb-6 text-indigo-500 group-hover:scale-110 transition-transform">
              <feat.icon className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-lg mb-3 text-white">{feat.title}</h4>
            <p className="text-sm text-white/40 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};