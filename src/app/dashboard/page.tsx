"use client"

import React, { useState } from 'react';
import { 
  BarChart3, Database, Brain, RefreshCw, Plus, ShieldAlert, FileText, TrendingUp, Filter, Lightbulb, ClipboardCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DatasetUpload } from '@/components/dashboard/DatasetUpload';
import { StatVisuals } from '@/components/dashboard/StatVisuals';
import { calculateDescriptiveStats, DescriptiveStats } from '@/lib/stats-engine';
import { narrativeAnalysisGenerator, NarrativeAnalysisGeneratorOutput } from '@/ai/flows/narrative-analysis-generator';
import { ParsedData } from '@/lib/data-parser';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [currentDataset, setCurrentDataset] = useState<ParsedData | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [narrative, setNarrative] = useState<NarrativeAnalysisGeneratorOutput | null>(null);
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
        context: `Analysis of ${currentDataset.rows.length} records across ${Object.keys(descriptiveResults).length} numeric variables.`
      });
      setNarrative(result);
    } catch (err: any) {
      console.error("Narrative generation failed", err);
      toast({
        title: "AI Engine Busy",
        description: "Standard statistical analysis is complete, but automated interpretation is currently queued.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingNarrative(false);
    }
  };

  const numericColumns = currentDataset ? Object.keys(currentDataset.columnTypes).filter(h => currentDataset.columnTypes[h] === 'number') : [];

  return (
    <div className="flex flex-col min-h-screen data-grid">
      <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-black" />
            </div>
            <span className="font-headline font-bold text-lg tracking-tight">AutoStat<span className="text-primary italic">AI</span></span>
          </div>
          <div className="h-6 w-px bg-white/10 hidden md:block" />
          <nav className="hidden md:flex gap-4">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">ANALYTICS</Button>
            <Button variant="ghost" size="sm" className="text-xs font-semibold opacity-60">WORKFLOWS</Button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-primary/30 text-primary text-[10px] px-3 uppercase">StatEngine v3.1</Badge>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
             <Database className="h-3.5 w-3.5 text-primary/60" />
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-8 max-w-[1400px]">
        {!currentDataset ? (
          <div className="py-12 animate-in fade-in zoom-in-95 duration-500">
            <DatasetUpload onUpload={handleUpload} />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-md">
              <div>
                <h2 className="text-2xl font-headline font-bold flex items-center gap-3">
                  Dataset Explorer
                  <Badge className="bg-primary/20 text-primary border-none text-[10px]">ACTIVE</Badge>
                </h2>
                <div className="flex gap-4 mt-1 text-[11px] text-muted-foreground font-medium uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5" /> {currentDataset.rows.length} ROWS</span>
                  <span className="flex items-center gap-1.5"><Filter className="h-3.5 w-3.5" /> {currentDataset.headers.length} COLUMNS</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 border-white/10 bg-white/5 hover:bg-white/10" onClick={() => setCurrentDataset(null)}>
                  <RefreshCw className="h-4 w-4 mr-2" /> NEW DATASET
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-black rounded-xl h-10 px-6 font-bold shadow-lg shadow-primary/20">
                  EXPORT ANALYSIS
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-8 space-y-8">
                <Tabs defaultValue="visuals" className="w-full">
                  <TabsList className="bg-slate-950/60 border border-white/5 p-1 rounded-xl mb-6 shadow-xl">
                    <TabsTrigger value="visuals" className="rounded-lg px-8 data-[state=active]:bg-primary data-[state=active]:text-black font-semibold text-xs transition-all">DISTRIBUTIONS</TabsTrigger>
                    <TabsTrigger value="table" className="rounded-lg px-8 data-[state=active]:bg-primary data-[state=active]:text-black font-semibold text-xs transition-all">DATA GRID</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="visuals">
                    <StatVisuals data={currentDataset.rows} numericColumns={numericColumns} />
                  </TabsContent>

                  <TabsContent value="table">
                    <Card className="glass-card border-none overflow-hidden rounded-3xl shadow-2xl">
                      <div className="overflow-x-auto max-h-[600px] scrollbar-hide">
                        <table className="w-full text-left text-[12px]">
                          <thead className="bg-slate-950/90 sticky top-0 z-10 text-muted-foreground font-bold uppercase tracking-widest">
                            <tr>
                              {currentDataset.headers.map(h => (
                                <th key={h} className="px-5 py-4 border-b border-white/5">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {currentDataset.rows.slice(0, 50).map((row, i) => (
                              <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                                {currentDataset.headers.map(h => (
                                  <td key={h} className="px-5 py-4 font-mono text-white/60 group-hover:text-white transition-colors">{row[h]}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="p-4 bg-slate-950/60 text-center border-t border-white/5">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">PREVIEWING FIRST 50 RECORDS</p>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>

                {aiSuggestions ? (
                  <Card className="glass border-primary/20 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Automated Data Audit
                      </CardTitle>
                      <CardDescription className="text-xs uppercase tracking-tight">AI Diagnostic scan complete.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-white/80 mb-6 italic border-l-2 border-primary/40 pl-4 bg-primary/5 py-4 rounded-r-xl">{aiSuggestions.summary}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiSuggestions.suggestions.map((s: any, idx: number) => (
                          <div key={idx} className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-primary/20 transition-all group">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{s.issueType}</span>
                              <Badge variant="outline" className="text-[9px] border-white/10 px-2">{s.affectedColumns[0]}</Badge>
                            </div>
                            <p className="text-xs text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">{s.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-slate-950/40 border-dashed border-white/10 rounded-3xl p-12 flex items-center justify-center text-center shadow-inner">
                    <div className="max-w-xs">
                      <ShieldAlert className="h-8 w-8 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-xs text-muted-foreground font-medium">AI Audit engine is currently in standby mode. Core statistical visuals remain fully active.</p>
                    </div>
                  </Card>
                )}
              </div>

              <div className="xl:col-span-4 space-y-8">
                <Card className="glass-card border-none rounded-3xl shadow-2xl overflow-hidden">
                   <div className="h-1 bg-white/5" />
                  <CardHeader>
                    <CardTitle className="text-lg">Key Indicators</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {numericColumns.slice(0, 4).map(col => (
                      <div key={col} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest">{col}</h4>
                          <TrendingUp className="h-3 w-3 text-primary/30" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { l: 'Mean', v: descriptiveResults[col]?.mean.toFixed(2) },
                            { l: 'Sigma', v: descriptiveResults[col]?.stdDev.toFixed(2) },
                            { l: 'Min', v: descriptiveResults[col]?.min.toFixed(2) },
                            { l: 'Max', v: descriptiveResults[col]?.max.toFixed(2) }
                          ].map(m => (
                            <div key={m.l} className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 shadow-inner">
                              <p className="text-[9px] text-muted-foreground font-bold mb-1 uppercase tracking-tighter opacity-70">{m.l}</p>
                              <p className="text-sm font-mono font-bold text-white/90">{m.v}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glass border-primary/30 rounded-3xl overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      Insight Synthesis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!narrative ? (
                      <div className="py-8 text-center">
                        <p className="text-xs text-muted-foreground mb-8 px-4 font-medium leading-relaxed">
                          Process complex statistical vectors into professional business narratives instantly.
                        </p>
                        <Button 
                          onClick={generateNarrative} 
                          disabled={isGeneratingNarrative}
                          className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-black rounded-2xl py-7 font-black text-xs uppercase tracking-widest transition-all shadow-lg"
                        >
                          {isGeneratingNarrative ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <FileText className="h-4 w-4 mr-2" />
                          )}
                          {isGeneratingNarrative ? 'SYNTHESIZING...' : 'GENERATE INSIGHTS'}
                        </Button>
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-top-4 space-y-6">
                        <div className="space-y-4">
                           <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5">
                             <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                               <ClipboardCheck className="h-3 w-3" /> Executive Summary
                             </h4>
                             <p className="text-xs leading-relaxed text-white/80">{narrative.executiveSummary}</p>
                           </div>

                           <div className="grid gap-3">
                             <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2 px-1">
                               <Lightbulb className="h-3 w-3" /> Key Insights
                             </h4>
                             {narrative.keyInsights.map((insight, i) => (
                               <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 text-[11px] text-white/70">
                                 {insight}
                               </div>
                             ))}
                           </div>

                           <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5">
                             <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Trend Trajectory</h4>
                             <p className="text-xs leading-relaxed text-white/70 italic">{narrative.dataTrends}</p>
                           </div>
                        </div>

                        <Button 
                          variant="ghost" 
                          className="w-full text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground hover:text-primary transition-all hover:bg-primary/5 py-6 rounded-xl" 
                          onClick={() => setNarrative(null)}
                        >
                          RE-SYNTHESIZE DATA
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
