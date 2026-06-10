"use client"

import React, { useState } from 'react';
import { 
  BarChart3, Database, RefreshCw, ShieldAlert, TrendingUp, Lightbulb, ClipboardCheck, AlertCircle, ArrowUpRight, Target, Sparkles, SearchCode, Zap
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
    } catch (err) {
      toast({
        title: "Audit Error",
        description: "Service busy. Diagnostics deferred to manual retry.",
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
        description: "Platform capacity reached. Retrying shortly.",
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
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-primary/30 text-primary text-[10px] px-3 uppercase">MISSION CONTROL ACTIVE</Badge>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6 md:p-8 max-w-[1700px]">
        {!currentDataset ? (
          <div className="py-12 animate-in fade-in zoom-in-95 duration-500">
            <DatasetUpload onUpload={handleUpload} />
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Control Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-slate-900/90 p-8 rounded-[3rem] border border-white/10 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Database className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-headline font-black text-white tracking-tight">
                    Active Mission: {currentDataset.rows.length} Records
                  </h2>
                  <p className="text-[10px] text-primary/60 font-black uppercase tracking-[0.3em] mt-1">Multi-Vector Ingestion Stable</p>
                </div>
              </div>
              <div className="flex gap-4 w-full lg:w-auto">
                <Button variant="outline" size="lg" className="flex-1 lg:flex-none rounded-2xl h-14 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold" onClick={() => setCurrentDataset(null)}>
                  <RefreshCw className="h-5 w-5 mr-3" /> SWAP SOURCE
                </Button>
                <Button size="lg" className="flex-1 lg:flex-none bg-primary hover:bg-primary/90 text-black rounded-2xl h-14 px-10 font-black shadow-2xl shadow-primary/20">
                  EXPORT LOG
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 2xl:grid-cols-12 gap-10">
              <div className="2xl:col-span-8 space-y-10">
                <Tabs defaultValue="visuals" className="w-full">
                  <TabsList className="bg-slate-950/90 border border-white/10 p-2 rounded-[2rem] mb-10">
                    <TabsTrigger value="visuals" className="rounded-[1.5rem] px-14 py-4 data-[state=active]:bg-primary data-[state=active]:text-black font-black text-xs uppercase tracking-widest">Telemetry</TabsTrigger>
                    <TabsTrigger value="table" className="rounded-[1.5rem] px-14 py-4 data-[state=active]:bg-primary data-[state=active]:text-black font-black text-xs uppercase tracking-widest">Raw Grid</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="visuals">
                    <StatVisuals data={currentDataset.rows} numericColumns={numericColumns} />
                  </TabsContent>

                  <TabsContent value="table">
                    <Card className="glass border-none overflow-hidden rounded-[3rem] shadow-2xl">
                      <div className="overflow-x-auto max-h-[700px]">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-950 sticky top-0 z-10 text-primary font-black uppercase tracking-widest border-b border-white/5">
                            <tr>
                              {currentDataset.headers.map(h => <th key={h} className="px-8 py-6">{h}</th>)}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {currentDataset.rows.slice(0, 100).map((row, i) => (
                              <tr key={i} className="hover:bg-primary/[0.02] transition-colors group">
                                {currentDataset.headers.map(h => (
                                  <td key={h} className="px-8 py-5 font-mono text-white/50 group-hover:text-white">{row[h]}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Audit Section */}
                <Card className="glass border-primary/20 rounded-[3rem] shadow-2xl overflow-hidden relative group">
                  <CardHeader className="pb-8 pt-10 px-10">
                    <CardTitle className="text-2xl flex items-center gap-4 text-white font-black">
                      <SearchCode className="h-8 w-8 text-primary" />
                      Structural Diagnostics
                    </CardTitle>
                    <CardDescription className="text-xs uppercase tracking-[0.2em] font-black text-primary/60">Automated quality validation & risk detection</CardDescription>
                  </CardHeader>
                  <CardContent className="px-10 pb-12">
                    {aiSuggestions ? (
                      <div className="space-y-10">
                        <div className="p-10 rounded-[2.5rem] bg-primary/5 border border-primary/20">
                           <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-4">Diagnostics Result</h4>
                           <p className="text-lg text-white/90 leading-relaxed font-bold italic">"{aiSuggestions.summary}"</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {aiSuggestions.suggestions.map((s, idx) => (
                            <div key={idx} className="p-8 rounded-[2.5rem] bg-slate-950/60 border border-white/5 hover:border-primary/40 transition-all">
                              <Badge variant="outline" className="text-[9px] border-primary/40 text-primary font-black px-4 py-1.5 uppercase mb-6">{s.issueType}</Badge>
                              <h5 className="text-base font-black text-white mb-4">{s.description}</h5>
                              <p className="text-sm text-white/50 leading-relaxed mb-6">{s.suggestion}</p>
                            </div>
                          ))}
                        </div>
                        <Button variant="ghost" className="w-full text-[10px] font-black text-white/20 hover:text-primary py-8 border border-dashed border-white/10 rounded-2xl" onClick={runAudit} disabled={isAuditing}>
                          {isAuditing ? <RefreshCw className="h-4 w-4 mr-3 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-3" />}
                          INITIATE HIGH-FIDELITY RE-SCAN
                        </Button>
                      </div>
                    ) : (
                      <div className="py-24 text-center">
                        <ShieldAlert className="h-16 w-16 text-white/20 mx-auto mb-8" />
                        <h4 className="text-3xl font-black text-white mb-4">Audit Pipeline Pending</h4>
                        <Button onClick={runAudit} disabled={isAuditing} className="bg-primary hover:bg-primary/90 text-black rounded-full px-16 h-16 font-black text-sm uppercase tracking-widest">
                          {isAuditing ? 'SCANNING...' : 'RUN STRUCTURAL DIAGNOSTIC'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar / Forecast */}
              <div className="2xl:col-span-4 space-y-10">
                <Card className="glass border-none rounded-[3rem] shadow-2xl p-10">
                  <CardHeader className="p-0 mb-10">
                    <CardTitle className="text-xl text-white font-black flex items-center gap-3">
                      <Target className="h-6 w-6 text-primary" />
                      Core Trajectories
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-8">
                    {numericColumns.slice(0, 3).map(col => (
                      <div key={col} className="bg-slate-950 p-8 rounded-[2rem] border border-white/5">
                        <h4 className="text-[10px] font-black text-primary uppercase mb-4">{col}</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <div><p className="text-[8px] text-white/30 uppercase">Mean</p><p className="text-xl font-mono text-white">{descriptiveResults[col]?.mean.toFixed(2)}</p></div>
                           <div><p className="text-[8px] text-white/30 uppercase">StdDev</p><p className="text-xl font-mono text-white">{descriptiveResults[col]?.stdDev.toFixed(2)}</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="glass border-primary/40 rounded-[3rem] overflow-hidden shadow-2xl relative min-h-[800px] flex flex-col group">
                  <CardHeader className="pb-6 pt-12 px-10">
                    <CardTitle className="text-3xl flex items-center gap-4 text-white font-black tracking-tighter">
                      <Sparkles className="h-10 w-10 text-primary" />
                      HERO FORECAST
                    </CardTitle>
                    <Badge variant="outline" className="mt-4 border-primary/40 text-primary font-black uppercase px-4 py-2">Predictive Synthesis Engine</Badge>
                  </CardHeader>
                  <CardContent className="px-10 pb-12 flex-grow flex flex-col">
                    {!narrative ? (
                      <div className="flex-grow flex flex-col items-center justify-center text-center">
                        <TrendingUp className="h-20 w-20 text-white/20 mb-10" />
                        <h3 className="text-3xl font-black text-white mb-6">Initiate Synthesis</h3>
                        <Button 
                          onClick={generateNarrative} 
                          disabled={isGeneratingNarrative}
                          className="w-full bg-primary hover:bg-primary/90 text-black rounded-[2.5rem] h-24 font-black text-lg uppercase shadow-2xl shadow-primary/20"
                        >
                          {isGeneratingNarrative ? <RefreshCw className="h-8 w-8 mr-4 animate-spin" /> : <Zap className="h-8 w-8 mr-4" />}
                          {isGeneratingNarrative ? 'SYNTHESIZING...' : 'RUN FORECAST'}
                        </Button>
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-top-12 duration-1000 space-y-12">
                        <div className="p-12 rounded-[3.5rem] bg-gradient-to-br from-primary/40 to-slate-950 border-2 border-primary shadow-2xl relative">
                           <div className="flex items-center justify-between mb-10">
                             <Badge className="bg-primary text-black font-black px-6 py-2 rounded-full uppercase">
                               {narrative.forecasting.confidence.toUpperCase()} CONFIDENCE
                             </Badge>
                           </div>
                           <h2 className="text-4xl md:text-5xl font-headline font-black text-white mb-10 leading-[1.1]">
                             {narrative.forecasting.projection}
                           </h2>
                           <div className="pt-10 border-t border-primary/30">
                              <h5 className="text-[11px] font-black text-white/40 uppercase mb-4">TIME HORIZON: {narrative.forecasting.timeframe}</h5>
                           </div>
                        </div>

                        <ScrollArea className="h-[400px] pr-6">
                          <div className="space-y-10 pb-10">
                            <div className="bg-slate-950 p-10 rounded-[3rem] border border-white/10">
                               <h4 className="text-[11px] font-black text-primary uppercase flex items-center gap-3 mb-6"><ClipboardCheck className="h-5 w-5" /> EXECUTIVE LOG</h4>
                               <p className="text-lg leading-relaxed text-white/80 font-bold italic">"{narrative.executiveSummary}"</p>
                            </div>
                            <div className="space-y-6">
                               <h4 className="text-[11px] font-black text-primary uppercase flex items-center gap-3 px-2"><Lightbulb className="h-5 w-5" /> STRATEGIC MANEUVERS</h4>
                               <div className="space-y-4">
                                 {narrative.keyInsights.map((insight, i) => (
                                   <div key={i} className="bg-white/5 p-6 rounded-[2rem] border border-white/10 text-sm text-white/90 font-bold flex gap-4">
                                     <span className="text-primary font-black">{i+1}</span>
                                     {insight}
                                   </div>
                                 ))}
                               </div>
                            </div>
                          </div>
                        </ScrollArea>

                        <Button 
                          variant="ghost" 
                          className="w-full text-[11px] uppercase font-black text-white/10 hover:text-primary py-8 rounded-[3rem] border border-dashed border-white/5" 
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