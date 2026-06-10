"use client"

import React, { useState, useMemo, useRef } from 'react';
import { 
  BarChart3, LayoutDashboard, Sparkles, ShieldCheck, 
  Zap, BrainCircuit, Loader2, RefreshCw,
  AlertTriangle, Target, Activity
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DatasetUpload } from '@/components/dashboard/DatasetUpload';
import { StatVisuals } from '@/components/dashboard/StatVisuals';
import { calculateDescriptiveStats, DescriptiveStats, calculatePearsonCorrelation } from '@/lib/stats-engine';
import { ParsedData, getCsvSample } from '@/lib/data-parser';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { runAuditAction, runInsightsAction } from '@/app/actions/analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function Dashboard() {
  const [currentDataset, setCurrentDataset] = useState<ParsedData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [auditResults, setAuditResults] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Cache for insights linked to the current dataset rows count and headers
  const insightsCache = useRef<Record<string, any>>({});
  
  const { toast } = useToast();

  const handleUpload = (data: ParsedData) => {
    setCurrentDataset(data);
    setInsights(null);
    setAuditResults(null);
    setAnalysisError(null);
    toast({ title: "Dataset Uploaded", description: `Successfully ingested ${data.rows.length} records.` });
  };

  const descriptiveResults = useMemo(() => {
    if (!currentDataset) return {};
    const results: Record<string, DescriptiveStats> = {};
    const numericCols = Object.keys(currentDataset.columnTypes).filter(h => currentDataset.columnTypes[h] === 'number');
    numericCols.forEach(col => {
      const vals = currentDataset.rows.map(r => r[col]).filter(v => typeof v === 'number');
      if (vals.length > 0) {
        results[col] = calculateDescriptiveStats(vals);
      }
    });
    return results;
  }, [currentDataset]);

  const numericColumns = currentDataset ? Object.keys(currentDataset.columnTypes).filter(h => currentDataset.columnTypes[h] === 'number') : [];
  const categoricalColumns = currentDataset ? Object.keys(currentDataset.columnTypes).filter(h => currentDataset.columnTypes[h] === 'string') : [];

  const runAiAnalysis = async () => {
    if (!currentDataset || isAnalyzing) return;

    // Generate unique key for current dataset state
    const cacheKey = `${currentDataset.rows.length}-${currentDataset.headers.join('-')}`;
    
    // Check Cache
    if (insightsCache.current[cacheKey]) {
      setInsights(insightsCache.current[cacheKey]);
      toast({ title: "Insights Loaded", description: "Retrieved cached strategic synthesis." });
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    // 1. Calculate correlations and summary statistics client-side to reduce AI payload
    const correlations: string[] = [];
    if (numericColumns.length >= 2) {
      for (let i = 0; i < Math.min(numericColumns.length, 5); i++) {
        for (let j = i + 1; j < Math.min(numericColumns.length, 5); j++) {
          const c1 = numericColumns[i];
          const c2 = numericColumns[j];
          const x = currentDataset.rows.map(r => r[c1]).filter(v => typeof v === 'number');
          const y = currentDataset.rows.map(r => r[c2]).filter(v => typeof v === 'number');
          const r = calculatePearsonCorrelation(x, y);
          if (Math.abs(r) > 0.5) {
            correlations.push(`${c1} vs ${c2}: ${r.toFixed(2)}`);
          }
        }
      }
    }

    const statsSummary = Object.entries(descriptiveResults).map(([col, stats]) => {
      return `Column: ${col}\n- Mean: ${stats.mean.toFixed(2)}\n- Median: ${stats.median.toFixed(2)}\n- StdDev: ${stats.stdDev.toFixed(2)}\n- Outliers: ${stats.outliers.length}\n- Range: [${stats.min}, ${stats.max}]`;
    }).join('\n\n') + `\n\nTop Correlations:\n${correlations.join('\n')}`;

    // 2. Optimized Sample (Very small to reduce token usage/errors)
    const sample = getCsvSample(currentDataset, 10); 
    
    console.log(`[Dashboard] Single Synthesis Request Initiated at ${new Date().toLocaleTimeString()}`);

    try {
      const insightsRes = await runInsightsAction({
        datasetPreview: sample,
        statsSummary,
        columnNames: currentDataset.headers
      });

      if (insightsRes.success) {
        setInsights(insightsRes.data);
        insightsCache.current[cacheKey] = insightsRes.data; // Cache the result
        toast({ title: "Analysis Complete", description: "Strategic synthesis generated successfully." });
      } else {
        setAnalysisError(insightsRes.error || "Synthesis failed to initialize.");
        toast({ variant: "destructive", title: "Synthesis Difficulty", description: insightsRes.error });
      }

      // Run quality audit separately if not already present
      if (!auditResults) {
        const auditRes = await runAuditAction(sample, currentDataset.headers);
        if (auditRes.success) {
          setAuditResults(auditRes.data);
        }
      }
    } catch (err: any) {
      setAnalysisError("An unexpected response was received from the server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const dataHealthScore = useMemo(() => {
    if (!currentDataset) return 0;
    if (auditResults?.qualityScore) return auditResults.qualityScore;
    return 85; 
  }, [currentDataset, auditResults]);

  const tickerItems = [
    "NEURAL SYNTHESIS ACTIVE",
    "DATA VECTORS NORMALIZED",
    "STATISTICAL INFERENCE COMPLETE",
    "PREDICTIVE HORIZON MAPPED",
    "ANOMALY DETECTION STABLE",
    "ENTERPRISE TELEMETRY ONLINE",
    "STRATEGIC INSIGHTS GENERATED",
    "SINGLE-CALL SYNTHESIS PROTOCOL"
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans selection:bg-indigo-500/30">
      {/* Top Telemetry Ticker */}
      <div className="bg-indigo-600/10 border-b border-indigo-500/20 py-2 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee flex items-center gap-12">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <Activity className="h-3 w-3 text-indigo-500" />
              <span className="text-[10px] font-black text-indigo-400/60 tracking-[0.3em] uppercase">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <BarChart3 className="text-white h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">AutoStat AI</span>
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <nav className="flex items-center gap-6 text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
            <span className="text-indigo-500 flex items-center gap-2"><LayoutDashboard className="h-3.5 w-3.5" /> Dashboard</span>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="border-indigo-500/20 text-indigo-400 bg-indigo-500/5 text-[10px] font-bold px-4 py-1.5 uppercase tracking-widest">
            STATUS: {isAnalyzing ? 'ANALYZING...' : 'ONLINE'}
          </Badge>
        </div>
      </header>

      <main className="p-10 max-w-[1700px] mx-auto space-y-10">
        {!currentDataset ? (
          <div className="py-20 animate-in fade-in zoom-in-95 duration-1000">
            <DatasetUpload onUpload={handleUpload} />
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            {/* AI Insights Hero Panel */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <Card className="relative bg-zinc-950/50 border-white/10 backdrop-blur-xl overflow-hidden rounded-[2rem]">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 p-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-600/20">
                      <BrainCircuit className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold tracking-tight">AI Strategic Synthesis</CardTitle>
                      <CardDescription className="text-white/40 font-medium">Enterprise-grade narrative generation from statistical summaries</CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={runAiAnalysis} 
                    disabled={isAnalyzing}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 px-8 font-bold uppercase tracking-widest text-xs shadow-lg shadow-indigo-600/20"
                  >
                    {isAnalyzing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                    {isAnalyzing ? "AI analysis in progress..." : insights ? "Regenerate Insights" : "Run AI Synthesis"}
                  </Button>
                </CardHeader>
                <CardContent className="p-10">
                  {analysisError && (
                    <Alert variant="destructive" className="mb-8 bg-red-500/10 border-red-500/20 text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Synthesis Difficulty</AlertTitle>
                      <AlertDescription>
                        {analysisError}
                        <Button variant="link" size="sm" onClick={runAiAnalysis} className="text-red-400 font-bold ml-2">Retry Mission</Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {isAnalyzing ? (
                    <div className="space-y-8 py-10">
                      <div className="flex items-center gap-4">
                        <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                        <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs animate-pulse">Engaging Analytical Engines... (Single Request Active)</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Skeleton className="h-40 rounded-2xl bg-white/5" />
                        <Skeleton className="h-40 rounded-2xl bg-white/5" />
                        <Skeleton className="h-40 rounded-2xl bg-white/5" />
                      </div>
                    </div>
                  ) : insights ? (
                    <div className="space-y-12 animate-in fade-in duration-700">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-8">
                          <div>
                            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-4">Executive Summary</h4>
                            <p className="text-xl text-white/90 leading-relaxed font-medium">{insights.executiveSummary}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="bg-white/5 border-white/10 rounded-2xl overflow-hidden">
                              <CardContent className="p-6">
                                <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles className="h-3 w-3 text-indigo-500" /> Key Findings</h5>
                                <ul className="space-y-3">
                                  {insights.keyFindings.map((f: string, i: number) => (
                                    <li key={i} className="text-sm text-white/70 flex items-start gap-3">
                                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                      {f}
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                            <Card className="bg-white/5 border-white/10 rounded-2xl overflow-hidden">
                              <CardContent className="p-6">
                                <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2"><Target className="h-3 w-3 text-emerald-500" /> Opportunities</h5>
                                <ul className="space-y-3">
                                  {insights.businessOpportunities.map((o: string, i: number) => (
                                    <li key={i} className="text-sm text-white/70 flex items-start gap-3">
                                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                      {o}
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                        <div className="space-y-8">
                          <Card className="bg-indigo-600/10 border-indigo-500/20 rounded-[2rem] text-center p-8">
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Analysis Certainty</p>
                            <div className="text-6xl font-black text-white mb-4">{insights.confidenceScore}%</div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                              <div className="h-full bg-indigo-500" style={{ width: `${insights.confidenceScore}%` }} />
                            </div>
                            <p className="text-xs text-white/40">Statistical Confidence</p>
                          </Card>
                          <Card className="bg-red-500/5 border-red-500/20 rounded-2xl p-6">
                            <h5 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2"><AlertTriangle className="h-3 w-3" /> Risks</h5>
                            <ul className="space-y-2">
                              {insights.potentialRisks.map((r: string, i: number) => (
                                <li key={i} className="text-xs text-red-200/60 leading-relaxed">- {r}</li>
                              ))}
                            </ul>
                          </Card>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                      <div className="p-6 rounded-full bg-white/5 border border-white/10">
                        <BrainCircuit className="h-12 w-12 text-white/20" />
                      </div>
                      <p className="text-white/60 font-bold uppercase tracking-[0.2em] text-sm">Upload a dataset and click Run AI Synthesis to generate insights.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Data Health', value: `${dataHealthScore}%`, icon: ShieldCheck, color: 'text-indigo-400' },
                { label: 'Numeric Vectors', value: numericColumns.length, icon: Zap, color: 'text-emerald-400' },
                { label: 'Total Records', value: currentDataset.rows.length.toLocaleString(), icon: Activity, color: 'text-blue-400' },
                { label: 'Anomalies', value: auditResults?.issuesIdentified?.length || 0, icon: AlertTriangle, color: 'text-yellow-400' },
              ].map((stat, i) => (
                <Card key={i} className="bg-white/5 border-white/10 rounded-[2rem] overflow-hidden">
                  <CardContent className="p-8 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-10 w-10 ${stat.color} opacity-20`} />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="visuals" className="w-full">
              <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl mb-10 h-auto flex flex-wrap gap-2">
                <TabsTrigger value="visuals" className="rounded-xl px-10 py-3 text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-indigo-600">Visualizations</TabsTrigger>
                <TabsTrigger value="stats" className="rounded-xl px-10 py-3 text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-indigo-600">Statistics</TabsTrigger>
                <TabsTrigger value="table" className="rounded-xl px-10 py-3 text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-indigo-600">Raw Data</TabsTrigger>
              </TabsList>
              <TabsContent value="visuals" className="mt-0 outline-none">
                <StatVisuals data={currentDataset.rows} numericColumns={numericColumns} categoricalColumns={categoricalColumns} />
              </TabsContent>
              <TabsContent value="stats" className="mt-0 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {numericColumns.map(col => (
                    <Card key={col} className="bg-white/5 border-white/10 rounded-[2rem] overflow-hidden">
                      <CardHeader className="border-b border-white/5 p-8">
                        <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">{col}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="grid grid-cols-2 gap-y-6">
                          <div><p className="text-[10px] font-bold text-white/30 mb-1">Mean</p><p className="text-xl font-black">{descriptiveResults[col]?.mean.toFixed(2)}</p></div>
                          <div><p className="text-[10px] font-bold text-white/30 mb-1">Median</p><p className="text-xl font-black">{descriptiveResults[col]?.median.toFixed(2)}</p></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="table" className="mt-0 outline-none">
                <Card className="bg-white/5 border-white/10 rounded-[2rem] overflow-hidden">
                  <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/[0.04] sticky top-0 text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">
                        <tr>{currentDataset.headers.map(h => <th key={h} className="px-8 py-6">{h}</th>)}</tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/60">
                        {currentDataset.rows.slice(0, 50).map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.02]">
                            {currentDataset.headers.map(h => <td key={h} className="px-8 py-4 font-mono text-xs">{row[h]}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
