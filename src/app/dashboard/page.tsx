"use client"

import React, { useState } from 'react';
import { 
  BarChart3, Database, Brain, RefreshCw, Plus, ShieldAlert, FileText, TrendingUp, Filter, Lightbulb, ClipboardCheck, AlertCircle, ArrowUpRight, Target, Sparkles, ChevronRight, Activity, Zap
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
import { ScrollArea } from '@/components/ui/scroll-area';

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
      toast({
        title: "Synthesis Complete",
        description: "AI has successfully modeled data trends and projections.",
      });
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
            <span className="font-headline font-bold text-lg tracking-tight text-white">AutoStat<span className="text-primary italic">AI</span></span>
          </div>
          <div className="h-6 w-px bg-white/10 hidden md:block" />
          <nav className="hidden md:flex gap-4">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">ANALYTICS</Button>
            <Button variant="ghost" size="sm" className="text-xs font-semibold opacity-60">WORKFLOWS</Button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-primary/30 text-primary text-[10px] px-3 uppercase tracking-tighter">System Ready</Badge>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
             <Activity className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6 md:p-8 max-w-[1600px]">
        {!currentDataset ? (
          <div className="py-12 animate-in fade-in zoom-in-95 duration-500">
            <DatasetUpload onUpload={handleUpload} />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 p-6 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-headline font-bold text-white flex items-center gap-2">
                    Active Dataset Workspace
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[9px] px-2">SYNCED</Badge>
                  </h2>
                  <div className="flex gap-4 mt-0.5 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em]">
                    <span className="flex items-center gap-1.5">{currentDataset.rows.length} SAMPLES</span>
                    <span className="flex items-center gap-1.5">{currentDataset.headers.length} DIMENSIONS</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <Button variant="outline" size="sm" className="flex-1 md:flex-none rounded-xl h-12 px-6 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs" onClick={() => setCurrentDataset(null)}>
                  <RefreshCw className="h-4 w-4 mr-2" /> SWAP DATASET
                </Button>
                <Button size="sm" className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-black rounded-xl h-12 px-8 font-black text-xs shadow-xl shadow-primary/20">
                  EXPORT ANALYSIS
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-8 space-y-8">
                {/* Main Visuals & Table Tabs */}
                <Tabs defaultValue="visuals" className="w-full">
                  <TabsList className="bg-slate-950/80 border border-white/5 p-1.5 rounded-2xl mb-8 shadow-2xl">
                    <TabsTrigger value="visuals" className="rounded-xl px-10 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-black font-bold text-xs tracking-widest transition-all">DISTRIBUTIONS</TabsTrigger>
                    <TabsTrigger value="table" className="rounded-xl px-10 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-black font-bold text-xs tracking-widest transition-all">DATA GRID</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="visuals">
                    <StatVisuals data={currentDataset.rows} numericColumns={numericColumns} />
                  </TabsContent>

                  <TabsContent value="table">
                    <Card className="glass-card border-none overflow-hidden rounded-[2.5rem] shadow-2xl">
                      <div className="overflow-x-auto max-h-[600px]">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-950/90 sticky top-0 z-10 text-muted-foreground font-bold uppercase tracking-widest">
                            <tr>
                              {currentDataset.headers.map(h => (
                                <th key={h} className="px-6 py-5 border-b border-white/5">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {currentDataset.rows.slice(0, 50).map((row, i) => (
                              <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                                {currentDataset.headers.map(h => (
                                  <td key={h} className="px-6 py-4 font-mono text-white/40 group-hover:text-white transition-colors">{row[h]}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="p-4 bg-slate-950/60 text-center border-t border-white/5">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">RECORDS 1-50 OF {currentDataset.rows.length}</p>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Audit Engine Section */}
                <Card className="glass border-primary/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl flex items-center gap-3 text-white">
                      <Zap className="h-6 w-6 text-primary" />
                      Intelligent Quality Audit
                    </CardTitle>
                    <CardDescription className="text-xs uppercase tracking-[0.1em] font-bold text-primary/60">Automated diagnostic scan for data structural integrity.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {aiSuggestions ? (
                      <div className="space-y-8">
                        <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                             <Brain className="h-20 w-20 text-primary" />
                           </div>
                           <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">Diagnostic Summary</h4>
                           <p className="text-sm text-white/90 leading-relaxed font-medium relative z-10 italic">
                             "{aiSuggestions.summary}"
                           </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {aiSuggestions.suggestions.map((s: any, idx: number) => (
                            <div key={idx} className="p-6 rounded-3xl bg-slate-950/40 border border-white/5 hover:border-primary/30 transition-all group relative">
                              <div className="flex justify-between items-start mb-4">
                                <Badge variant="outline" className="text-[9px] border-primary/20 text-primary font-black px-3 py-1 uppercase tracking-tighter">
                                  {s.issueType}
                                </Badge>
                                <span className="text-[9px] font-bold text-white/20 uppercase">Audit ID: {(idx+1).toString().padStart(3, '0')}</span>
                              </div>
                              <h5 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-primary/60" />
                                {s.description}
                              </h5>
                              <p className="text-xs text-white/50 leading-relaxed group-hover:text-white/80 transition-colors mb-4">{s.suggestion}</p>
                              <div className="flex items-center gap-2 mt-auto">
                                <Badge className="bg-white/5 text-white/40 border-none text-[8px] px-2">{s.affectedColumns[0]}</Badge>
                                {s.affectedColumns.length > 1 && <span className="text-[8px] text-white/20">+{s.affectedColumns.length - 1} MORE</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-dashed border-white/10 flex items-center justify-center mb-6 animate-pulse">
                          <Brain className="h-8 w-8 text-white/10" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">Audit Pipeline Standby</h4>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                          The diagnostic engine is ready. Standard metrics are active, but deep AI structural auditing requires a secondary scan.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar: Stats & Narrative */}
              <div className="xl:col-span-4 space-y-8">
                {/* Core Stat Vectors */}
                <Card className="glass-card border-none rounded-[2.5rem] shadow-2xl overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-white font-bold flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Critical Distributions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8 p-6">
                    {numericColumns.slice(0, 3).map(col => (
                      <div key={col} className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                          <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.15em]">{col}</h4>
                          <ArrowUpRight className="h-4 w-4 text-primary/30" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { l: 'AVERAGE', v: descriptiveResults[col]?.mean.toFixed(2) },
                            { l: 'STABILITY (SD)', v: descriptiveResults[col]?.stdDev.toFixed(2) },
                            { l: 'LOWER BOUND', v: descriptiveResults[col]?.min.toFixed(2) },
                            { l: 'UPPER BOUND', v: descriptiveResults[col]?.max.toFixed(2) }
                          ].map(m => (
                            <div key={m.l} className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 shadow-inner transition-transform hover:scale-[1.02]">
                              <p className="text-[8px] text-white/30 font-black mb-1 uppercase tracking-widest">{m.l}</p>
                              <p className="text-base font-mono font-bold text-white/90">{m.v}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Insight & Forecast Engine */}
                <Card className="glass border-primary/40 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
                  <CardHeader className="pb-4 pt-8 px-8">
                    <CardTitle className="text-xl flex items-center gap-3 text-white font-bold">
                      <Sparkles className="h-6 w-6 text-primary" />
                      Forecasting Engine
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    {!narrative ? (
                      <div className="py-12 text-center">
                        <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/10 glow-primary-sm">
                          <TrendingUp className="h-10 w-10 text-primary" />
                        </div>
                        <p className="text-sm text-white/50 mb-10 font-medium leading-relaxed px-2">
                          Execute deep temporal modeling to predict future trajectories, confidence intervals, and strategic maneuvers.
                        </p>
                        <Button 
                          onClick={generateNarrative} 
                          disabled={isGeneratingNarrative}
                          className="w-full bg-primary hover:bg-primary/90 text-black rounded-2xl h-16 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-primary/30"
                        >
                          {isGeneratingNarrative ? (
                            <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                          ) : (
                            <Zap className="h-5 w-5 mr-3" />
                          )}
                          {isGeneratingNarrative ? 'GENERATING PROJECTIONS...' : 'EXECUTE FORECAST'}
                        </Button>
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-top-4 space-y-8">
                        {/* THE BIG FORECAST SECTION */}
                        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary/20 to-transparent border border-primary/30 shadow-[0_20px_50px_rgba(16,185,129,0.1)] relative overflow-hidden group">
                           <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity">
                             <TrendingUp className="h-60 w-60 text-primary" />
                           </div>
                           <div className="flex items-center justify-between mb-6">
                             <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                               <TrendingUp className="h-4 w-4" /> Predictive Projection
                             </h4>
                             <Badge className="bg-primary text-black text-[9px] font-black tracking-widest px-3 py-1">
                               {narrative.forecasting.confidence.toUpperCase()} CONFIDENCE
                             </Badge>
                           </div>
                           <p className="text-2xl font-headline font-bold leading-[1.2] text-white mb-6 tracking-tight">
                             {narrative.forecasting.projection}
                           </p>
                           <div className="grid grid-cols-2 gap-4 pt-6 border-t border-primary/10">
                              <div>
                                <h5 className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Time Horizon</h5>
                                <p className="text-xs font-bold text-primary">{narrative.forecasting.timeframe}</p>
                              </div>
                              <div>
                                <h5 className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Risk Vectors</h5>
                                <p className="text-xs font-bold text-white/80">{narrative.forecasting.risks.length} Identified</p>
                              </div>
                           </div>
                        </div>

                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-8 pb-4">
                            <div className="bg-slate-950/60 p-6 rounded-3xl border border-white/5">
                               <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                 <ClipboardCheck className="h-3.5 w-3.5" /> Executive Synthesis
                               </h4>
                               <p className="text-xs leading-relaxed text-white/70 font-medium">{narrative.executiveSummary}</p>
                            </div>

                            <div className="space-y-4">
                               <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                 <Lightbulb className="h-3.5 w-3.5" /> Key Observational Data
                               </h4>
                               <div className="space-y-3">
                                 {narrative.keyInsights.map((insight, i) => (
                                   <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 text-[11px] text-white/80 leading-relaxed flex gap-4 transition-colors hover:bg-white/[0.08]">
                                     <span className="text-primary font-bold">{(i+1).toString().padStart(2, '0')}</span>
                                     {insight}
                                   </div>
                                 ))}
                               </div>
                            </div>

                            <div className="bg-slate-950/60 p-6 rounded-3xl border border-white/5">
                               <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Strategic Recommendations</h4>
                               <div className="space-y-4">
                                 {narrative.recommendations.map((rec, i) => (
                                   <div key={i} className="flex gap-4 items-start group">
                                     <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary group-hover:scale-150 transition-transform shrink-0" />
                                     <p className="text-[11px] text-white/70 font-medium leading-relaxed">{rec}</p>
                                   </div>
                                 ))}
                               </div>
                            </div>
                          </div>
                        </ScrollArea>

                        <Button 
                          variant="ghost" 
                          className="w-full text-[10px] uppercase font-black tracking-[0.3em] text-white/20 hover:text-primary transition-all hover:bg-primary/5 py-8 rounded-2xl" 
                          onClick={() => setNarrative(null)}
                        >
                          REFRESH ENGINE
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
