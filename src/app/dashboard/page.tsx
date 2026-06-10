"use client"

import React, { useState } from 'react';
import { 
  BarChart3, Database, Brain, Download, RefreshCw, Info, Plus, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DatasetUpload } from '@/components/dashboard/DatasetUpload';
import { StatVisuals } from '@/components/dashboard/StatVisuals';
import { calculateDescriptiveStats, DescriptiveStats } from '@/lib/stats-engine';
import { narrativeAnalysisGenerator } from '@/ai/flows/narrative-analysis-generator';
import { ParsedData } from '@/lib/data-parser';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [currentDataset, setCurrentDataset] = useState<ParsedData | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [descriptiveResults, setDescriptiveResults] = useState<Record<string, DescriptiveStats>>({});
  const { toast } = useToast();

  const handleUpload = (data: ParsedData, suggestions: any) => {
    setCurrentDataset(data);
    setAiSuggestions(suggestions);
    
    const numericCols = Object.keys(data.columnTypes).filter(h => data.columnTypes[h] === 'number');
    const results: Record<string, DescriptiveStats> = {};
    numericCols.forEach(col => {
      const vals = data.rows.map(r => r[col]).filter(v => typeof v === 'number');
      if (vals.length > 0) {
        results[col] = calculateDescriptiveStats(vals);
      }
    });
    setDescriptiveResults(results);
    setNarrative(null);
  };

  const generateNarrative = async () => {
    if (!currentDataset) return;
    setIsGeneratingNarrative(true);
    try {
      const statsSummary = JSON.stringify(descriptiveResults);
      const result = await narrativeAnalysisGenerator({
        analysisResults: statsSummary,
        context: `Analysis of ${currentDataset.rows.length} records.`
      });
      setNarrative(result);
    } catch (err: any) {
      console.error("Narrative generation failed", err);
      toast({
        title: "AI Narrative Unavailable",
        description: "The analysis engine is currently busy. Please try again in a few minutes.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingNarrative(false);
    }
  };

  const numericColumns = currentDataset ? Object.keys(currentDataset.columnTypes).filter(h => currentDataset.columnTypes[h] === 'number') : [];

  return (
    <div className="flex flex-col min-h-screen data-grid">
      <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-black" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tighter">AutoStat<span className="text-primary italic">AI</span></span>
          </div>
          <div className="h-8 w-px bg-white/10 hidden md:block" />
          <nav className="hidden md:flex gap-6">
            <Button variant="ghost" size="sm" className="text-xs font-bold tracking-widest text-primary">WORKBENCH</Button>
            <Button variant="ghost" size="sm" className="text-xs font-bold tracking-widest opacity-40 hover:opacity-100">EXPLORER</Button>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="glass border-primary/30 text-primary px-4 py-1.5 font-mono text-[10px] tracking-tighter">V3.0_STABLE</Badge>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-white/10" />
        </div>
      </header>

      <main className="flex-grow container mx-auto p-10 max-w-[1500px]">
        {!currentDataset ? (
          <div className="py-24 animate-in fade-in zoom-in-95 duration-700">
            <DatasetUpload onUpload={handleUpload} />
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-headline font-bold">Workspace: {numericColumns[0] || 'Generic'} Analysis</h2>
                  <Badge className="bg-primary/20 text-primary border-primary/20 text-[10px] px-3 py-1">READY</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-2"><Database className="h-3.5 w-3.5 text-primary" /> {currentDataset.rows.length} OBSERVATIONS</span>
                  <span className="flex items-center gap-2"><Plus className="h-3.5 w-3.5 text-primary" /> {currentDataset.headers.length} DIMENSIONS</span>
                  <span className="flex items-center gap-2"><Brain className="h-3.5 w-3.5 text-primary" /> ENGINE ACTIVE</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 w-full xl:w-auto">
                <Button variant="outline" className="glass border-white/10 text-xs px-6 py-5 rounded-2xl" onClick={() => setCurrentDataset(null)}>
                  <RefreshCw className="h-4 w-4 mr-2" /> NEW DATASET
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-black text-xs font-black rounded-2xl px-10 py-5">
                  EXPORT PDF
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-10">
                <Tabs defaultValue="visuals" className="w-full">
                  <TabsList className="bg-slate-900/60 border border-white/5 p-1.5 rounded-2xl mb-8">
                    <TabsTrigger value="visuals" className="rounded-xl px-10 data-[state=active]:bg-primary data-[state=active]:text-black font-bold">VISUALIZATION</TabsTrigger>
                    <TabsTrigger value="table" className="rounded-xl px-10 data-[state=active]:bg-primary data-[state=active]:text-black font-bold">GRID VIEW</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="visuals">
                    <StatVisuals data={currentDataset.rows} numericColumns={numericColumns} />
                  </TabsContent>

                  <TabsContent value="table">
                    <Card className="glass-card border-none overflow-hidden rounded-[2.5rem]">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950/60 text-muted-foreground uppercase tracking-widest font-black">
                            <tr>
                              {currentDataset.headers.map(h => (
                                <th key={h} className="px-6 py-5 border-b border-white/5">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {currentDataset.rows.slice(0, 15).map((row, i) => (
                              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                                {currentDataset.headers.map(h => (
                                  <td key={h} className="px-6 py-5 font-mono text-muted-foreground">{row[h]}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="p-6 bg-slate-950/20 text-center border-t border-white/5">
                        <p className="text-[10px] text-muted-foreground tracking-widest font-bold">SYSTEM LIMIT: SHOWING TOP 15 ENTRIES</p>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>

                {aiSuggestions ? (
                  <Card className="glass border-primary/20 overflow-hidden rounded-[2.5rem] relative group">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl flex items-center gap-3">
                        <Brain className="h-6 w-6 text-primary" />
                        Automated Data Quality Scan
                      </CardTitle>
                      <CardDescription className="text-sm">Engineered insights for dataset remediation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-8 leading-relaxed italic border-l-2 border-primary/30 pl-6">"{aiSuggestions.summary}"</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {aiSuggestions.suggestions.slice(0, 4).map((s: any, idx: number) => (
                          <div key={idx} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all">
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-[11px] font-black text-primary tracking-widest uppercase">{s.issueType}</span>
                              <Badge variant="outline" className="text-[9px] border-white/10 px-2">{s.affectedColumns[0]}</Badge>
                            </div>
                            <p className="text-xs leading-relaxed text-white/70">{s.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="glass border-white/5 rounded-[2.5rem] p-10 flex items-center justify-center text-center">
                    <div className="space-y-4">
                      <ShieldAlert className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                      <p className="text-sm text-muted-foreground max-w-sm">AI Quality Scan is temporarily dormant due to high demand. Core statistical analysis remains fully functional.</p>
                    </div>
                  </Card>
                )}
              </div>

              <div className="lg:col-span-4 space-y-10">
                <Card className="glass-card border-none rounded-[2.5rem]">
                  <CardHeader>
                    <CardTitle className="text-xl">Core Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {numericColumns.slice(0, 3).map(col => (
                      <div key={col} className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-black text-primary uppercase tracking-tighter">{col}</h4>
                          <Badge variant="outline" className="text-[9px] opacity-40">NORMALIZED</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { l: 'Mean', v: descriptiveResults[col]?.mean.toFixed(2) },
                            { l: 'Median', v: descriptiveResults[col]?.median.toFixed(2) },
                            { l: 'σ (Sigma)', v: descriptiveResults[col]?.stdDev.toFixed(2) },
                            { l: 'Range Max', v: descriptiveResults[col]?.max.toFixed(2) }
                          ].map(m => (
                            <div key={m.l} className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                              <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">{m.l}</p>
                              <p className="text-lg font-mono font-bold tracking-tighter text-white">{m.v}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glass border-primary/30 relative overflow-hidden rounded-[2.5rem]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-50" />
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-3">
                      <Brain className="h-6 w-6 text-primary" />
                      Narrative Synthesis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!narrative ? (
                      <div className="py-10 text-center space-y-6">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Synthesize complex statistical trends into professional interpretation.
                        </p>
                        <Button 
                          onClick={generateNarrative} 
                          disabled={isGeneratingNarrative}
                          className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-black rounded-2xl py-8 border border-primary/20 transition-all font-black text-xs uppercase tracking-widest"
                        >
                          {isGeneratingNarrative ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Brain className="h-4 w-4 mr-2" />
                          )}
                          GENERATE INSIGHTS
                        </Button>
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-1000">
                        <div className="bg-slate-950/40 p-6 rounded-[2rem] border border-white/5 prose prose-invert prose-sm max-w-none">
                          <p className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap font-medium">
                            {narrative}
                          </p>
                        </div>
                        <Button variant="ghost" className="w-full mt-6 text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black h-10 hover:text-primary transition-colors" onClick={() => setNarrative(null)}>
                          REGENERATE SYNTHESIS
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}