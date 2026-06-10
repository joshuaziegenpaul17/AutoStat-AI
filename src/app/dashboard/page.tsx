"use client"

import React, { useState } from 'react';
import { 
  BarChart3, Database, RefreshCw, ShieldAlert, TrendingUp, Lightbulb, ClipboardCheck, Target, Sparkles, SearchCode, Zap, ChevronRight, LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DatasetUpload } from '@/components/dashboard/DatasetUpload';
import { StatVisuals } from '@/components/dashboard/StatVisuals';
import { calculateDescriptiveStats, DescriptiveStats } from '@/lib/stats-engine';
import { NarrativeAnalysisGeneratorOutput } from '@/ai/flows/narrative-analysis-generator';
import { DataQualitySuggesterOutput } from '@/ai/flows/data-quality-suggester';
import { ParsedData, getCsvSample } from '@/lib/data-parser';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { runAuditAction, runForecastAction } from '@/app/actions/analytics';

export default function Dashboard() {
  const [currentDataset, setCurrentDataset] = useState<ParsedData | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<DataQualitySuggesterOutput | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [narrative, setNarrative] = useState<NarrativeAnalysisGeneratorOutput | null>(null);
  const [descriptiveResults, setDescriptiveResults] = useState<Record<string, DescriptiveStats>>({});
  const { toast } = useToast();

  const handleUpload = (data: ParsedData, suggestions: DataQualitySuggesterOutput | null) => {
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

  const runAudit = async () => {
    if (!currentDataset) return;
    setIsAuditing(true);
    try {
      const sampleCsv = getCsvSample(currentDataset, 60);
      const res = await runAuditAction(sampleCsv);
      if (res.success) {
        setAiSuggestions(res.data as DataQualitySuggesterOutput);
        toast({ title: "Audit Complete", description: "Diagnostics successfully synthesized." });
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      toast({
        title: "Audit Error",
        description: err.message || "Service busy. Diagnostics deferred.",
        variant: "destructive"
      });
    } finally {
      setIsAuditing(false);
    }
  };

  const generateNarrative = async () => {
    if (!currentDataset) return;
    setIsGeneratingNarrative(true);
    try {
      const statsSummary = JSON.stringify(descriptiveResults);
      const res = await runForecastAction(statsSummary, `Modeling for ${currentDataset.rows.length} points.`);
      
      if (res.success) {
        setNarrative(res.data as NarrativeAnalysisGeneratorOutput);
        toast({ title: "Forecast Built", description: "Predictive temporal model synthesized." });
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      toast({
        title: "Modeling Deferred",
        description: err.message || "Platform capacity reached.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingNarrative(false);
    }
  };

  const numericColumns = currentDataset ? Object.keys(currentDataset.columnTypes).filter(h => currentDataset.columnTypes[h] === 'number') : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] data-grid mesh-gradient">
      <header className="h-20 glass border-b border-white/10 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
              <BarChart3 className="h-6 w-6 text-black" />
            </div>
            <span className="font-headline font-black text-xl tracking-tight text-white">AutoStat<span className="text-primary italic">AI</span></span>
          </Link>
          <div className="h-8 w-px bg-white/10 hidden md:block" />
          <nav className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest">
              <LayoutGrid className="h-3 w-3" /> Mission Workspace
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="border-primary/40 text-primary text-[10px] px-4 py-1.5 font-black uppercase tracking-[0.2em] bg-primary/5">
            ENGINE STATUS: OPTIMAL
          </Badge>
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10" />
        </div>
      </header>

      <main className="flex-grow p-8 md:p-12">
        {!currentDataset ? (
          <div className="py-20 animate-in fade-in zoom-in-95 duration-700">
            <DatasetUpload onUpload={handleUpload} />
          </div>
        ) : (
          <div className="max-w-[1800px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-slate-950/80 p-10 rounded-[3.5rem] border border-white/10 shadow-2xl backdrop-blur-3xl">
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 glow-primary">
                  <Database className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-black text-white tracking-tighter">
                      Mission Alpha: {currentDataset.rows.length.toLocaleString()} Records
                    </h2>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] font-black uppercase px-2 py-0.5">Verified</Badge>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="text-[10px] text-primary/60 font-black uppercase tracking-[0.4em]">Multi-Vector Stream Stable</p>
                    <div className="h-1 w-1 rounded-full bg-white/20" />
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em]">Latency: 14ms</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 w-full lg:w-auto">
                <Button variant="outline" size="lg" className="flex-1 lg:flex-none rounded-2xl h-16 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black px-8" onClick={() => setCurrentDataset(null)}>
                  <RefreshCw className="h-5 w-5 mr-3" /> SWAP MISSION
                </Button>
                <Button size="lg" className="flex-1 lg:flex-none bg-primary hover:bg-primary/90 text-black rounded-2xl h-16 px-12 font-black shadow-2xl shadow-primary/30">
                  EXPORT LOG
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 2xl:grid-cols-12 gap-12">
              <div className="2xl:col-span-8 space-y-12">
                <Tabs defaultValue="visuals" className="w-full">
                  <div className="flex items-center justify-between mb-8">
                    <TabsList className="bg-slate-950/80 border border-white/10 p-1.5 rounded-[2rem]">
                      <TabsTrigger value="visuals" className="rounded-[1.5rem] px-12 py-4 data-[state=active]:bg-primary data-[state=active]:text-black font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                        Telemetry View
                      </TabsTrigger>
                      <TabsTrigger value="table" className="rounded-[1.5rem] px-12 py-4 data-[state=active]:bg-primary data-[state=active]:text-black font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                        Grid Explorer
                      </TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-3 text-white/30 text-[10px] font-black uppercase tracking-widest">
                      <ChevronRight className="h-4 w-4 text-primary" /> Visual Synthesis Active
                    </div>
                  </div>
                  
                  <TabsContent value="visuals" className="mt-0 outline-none">
                    <StatVisuals data={currentDataset.rows} numericColumns={numericColumns} />
                  </TabsContent>

                  <TabsContent value="table" className="mt-0 outline-none">
                    <Card className="glass border-none overflow-hidden rounded-[3.5rem] shadow-2xl">
                      <div className="overflow-x-auto max-h-[750px] scrollbar-hide">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-950/95 sticky top-0 z-10 text-primary font-black uppercase tracking-[0.3em] border-b border-white/10">
                            <tr>
                              {currentDataset.headers.map(h => <th key={h} className="px-10 py-7">{h}</th>)}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {currentDataset.rows.slice(0, 100).map((row, i) => (
                              <tr key={i} className="hover:bg-primary/[0.03] transition-colors group">
                                {currentDataset.headers.map(h => (
                                  <td key={h} className="px-10 py-6 font-mono text-white/40 group-hover:text-white/80">{row[h]}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>

                <Card className="glass border-primary/20 rounded-[3.5rem] shadow-2xl overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <SearchCode className="h-40 w-40 text-primary" />
                  </div>
                  <CardHeader className="pb-10 pt-12 px-12">
                    <CardTitle className="text-3xl flex items-center gap-4 text-white font-black tracking-tighter">
                      <SearchCode className="h-9 w-9 text-primary glow-text" />
                      Structural Diagnostics
                    </CardTitle>
                    <CardDescription className="text-[10px] uppercase tracking-[0.4em] font-black text-primary/60 mt-2">Automated quality validation & risk detection</CardDescription>
                  </CardHeader>
                  <CardContent className="px-12 pb-16">
                    {aiSuggestions ? (
                      <div className="space-y-12">
                        <div className="p-12 rounded-[3rem] bg-primary/5 border border-primary/20 relative overflow-hidden group/audit">
                           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover/audit:opacity-100 transition-opacity" />
                           <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6">Diagnostics Conclusion</h4>
                           <p className="text-2xl text-white/90 leading-tight font-black italic relative z-10">"{aiSuggestions.summary}"</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          {aiSuggestions.suggestions.map((s, idx) => (
                            <div key={idx} className="p-10 rounded-[3rem] bg-slate-950/40 border border-white/5 hover:border-primary/40 transition-all group/item">
                              <Badge variant="outline" className="text-[9px] border-primary/40 text-primary font-black px-5 py-2 uppercase mb-8 bg-primary/5">{s.issueType}</Badge>
                              <h5 className="text-lg font-black text-white mb-6 group-hover/item:text-primary transition-colors">{s.description}</h5>
                              <p className="text-sm text-white/40 leading-relaxed mb-8">{s.suggestion}</p>
                              <div className="pt-6 border-t border-white/5 flex flex-wrap gap-2">
                                {s.affectedColumns.map(col => <Badge key={col} className="bg-white/5 text-white/40 text-[8px] border-none">{col}</Badge>)}
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="ghost" className="w-full text-[10px] font-black text-white/20 hover:text-primary py-10 border border-dashed border-white/10 rounded-3xl" onClick={runAudit} disabled={isAuditing}>
                          {isAuditing ? <RefreshCw className="h-5 w-5 mr-4 animate-spin" /> : <RefreshCw className="h-5 w-5 mr-4" />}
                          INITIATE HIGH-FIDELITY RE-SCAN
                        </Button>
                      </div>
                    ) : (
                      <div className="py-32 text-center">
                        <ShieldAlert className="h-20 w-20 text-white/10 mx-auto mb-10" />
                        <h4 className="text-4xl font-black text-white mb-6 tracking-tighter">Audit Pipeline Pending</h4>
                        <p className="text-white/30 text-lg mb-12 max-w-md mx-auto">Validate structural integrity and identify mission-critical anomalies.</p>
                        <Button onClick={runAudit} disabled={isAuditing} className="bg-primary hover:bg-primary/90 text-black rounded-full px-20 h-20 font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/20">
                          {isAuditing ? 'VALIDATING...' : 'INITIATE DIAGNOSTIC'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="2xl:col-span-4 space-y-12">
                <Card className="glass border-none rounded-[3.5rem] shadow-2xl p-12">
                  <CardHeader className="p-0 mb-12">
                    <CardTitle className="text-2xl text-white font-black flex items-center gap-4 tracking-tighter">
                      <Target className="h-7 w-7 text-primary glow-text" />
                      Core Vectors
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-8">
                    {numericColumns.slice(0, 4).map(col => (
                      <div key={col} className="bg-slate-950/60 p-8 rounded-[2.5rem] border border-white/5 hover:border-primary/20 transition-all">
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6">{col}</h4>
                        <div className="grid grid-cols-2 gap-8">
                           <div>
                             <p className="text-[9px] text-white/20 uppercase font-black mb-1">Mean</p>
                             <p className="text-2xl font-mono text-white tracking-tighter">{descriptiveResults[col]?.mean.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                           </div>
                           <div>
                             <p className="text-[9px] text-white/20 uppercase font-black mb-1">StdDev</p>
                             <p className="text-2xl font-mono text-white tracking-tighter">{descriptiveResults[col]?.stdDev.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="glass border-primary/40 rounded-[3.5rem] overflow-hidden shadow-2xl relative min-h-[850px] flex flex-col group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <CardHeader className="pb-8 pt-16 px-12 relative z-10">
                    <CardTitle className="text-4xl flex items-center gap-5 text-white font-black tracking-tighter glow-text">
                      <Sparkles className="h-12 w-12 text-primary" />
                      HERO FORECAST
                    </CardTitle>
                    <Badge variant="outline" className="mt-6 border-primary/50 text-primary font-black uppercase px-6 py-3 text-[10px] tracking-widest bg-primary/5">
                      Predictive Synthesis Active
                    </Badge>
                  </CardHeader>
                  <CardContent className="px-12 pb-16 flex-grow flex flex-col relative z-10">
                    {!narrative ? (
                      <div className="flex-grow flex flex-col items-center justify-center text-center py-20">
                        <TrendingUp className="h-24 w-24 text-white/10 mb-12" />
                        <h3 className="text-4xl font-black text-white mb-6 tracking-tighter">Initiate Synthesis</h3>
                        <p className="text-white/30 text-lg mb-16 max-w-xs mx-auto">Generate deep-temporal projections based on current data vectors.</p>
                        <Button 
                          onClick={generateNarrative} 
                          disabled={isGeneratingNarrative}
                          className="w-full bg-primary hover:bg-primary/90 text-black rounded-[3rem] h-28 font-black text-xl uppercase shadow-2xl shadow-primary/40 transition-all hover:scale-[1.02]"
                        >
                          {isGeneratingNarrative ? <RefreshCw className="h-10 w-10 mr-4 animate-spin" /> : <Zap className="h-10 w-10 mr-4" />}
                          {isGeneratingNarrative ? 'SYNTHESIZING...' : 'RUN FORECAST'}
                        </Button>
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-top-12 duration-1000 space-y-16">
                        <div className="p-14 rounded-[4rem] bg-gradient-to-br from-primary/30 via-slate-950 to-slate-950 border-2 border-primary shadow-[0_0_80px_-20px_rgba(16,185,129,0.4)] relative overflow-hidden group/forecast">
                           <div className="absolute top-0 right-0 p-10 opacity-10">
                             <TrendingUp className="h-40 w-40 text-primary" />
                           </div>
                           <div className="flex items-center justify-between mb-12">
                             <Badge className="bg-primary text-black font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest">
                               {narrative.forecasting.confidence.toUpperCase()} CONFIDENCE
                             </Badge>
                           </div>
                           <h2 className="text-5xl md:text-6xl font-headline font-black text-white mb-12 leading-[0.95] tracking-tighter relative z-10">
                             {narrative.forecasting.projection}
                           </h2>
                           <div className="pt-12 border-t border-primary/20">
                              <div className="flex justify-between items-center">
                                <h5 className="text-[11px] font-black text-white/50 uppercase tracking-[0.3em]">TIME HORIZON: {narrative.forecasting.timeframe}</h5>
                                <Badge variant="outline" className="border-white/10 text-white/40 uppercase font-black text-[9px]">Calculated v3.5</Badge>
                              </div>
                           </div>
                        </div>

                        <ScrollArea className="h-[450px] pr-8 scrollbar-hide">
                          <div className="space-y-12 pb-12">
                            <div className="bg-slate-950/80 p-12 rounded-[3.5rem] border border-white/10 shadow-xl">
                               <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-4 mb-8">
                                 <ClipboardCheck className="h-6 w-6" /> Executive Log
                               </h4>
                               <p className="text-xl leading-relaxed text-white/70 font-bold italic">"{narrative.executiveSummary}"</p>
                            </div>
                            <div className="space-y-8">
                               <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-4 px-4">
                                 <Lightbulb className="h-6 w-6" /> Strategic Maneuvers
                               </h4>
                               <div className="space-y-5">
                                 {narrative.keyInsights.map((insight, i) => (
                                   <div key={i} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 text-base text-white/80 font-bold flex gap-6 hover:bg-white/10 transition-colors">
                                     <span className="text-primary font-black text-xl leading-none">{i+1}</span>
                                     <span className="leading-snug">{insight}</span>
                                   </div>
                                 ))}
                               </div>
                            </div>
                          </div>
                        </ScrollArea>

                        <Button 
                          variant="ghost" 
                          className="w-full text-[11px] uppercase font-black text-white/10 hover:text-primary py-10 rounded-[3.5rem] border border-dashed border-white/10" 
                          onClick={() => setNarrative(null)}
                        >
                          RESET MISSION PARAMETERS
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