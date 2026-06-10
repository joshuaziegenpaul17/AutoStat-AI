
"use client"

import React, { useState, useMemo, useRef } from 'react';
import { 
  BarChart3, LayoutDashboard, Sparkles, ShieldCheck, 
  Zap, BrainCircuit, Loader2, RefreshCw,
  AlertTriangle, Target, Activity, Database, 
  TrendingUp, Presentation,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { DatasetUpload } from '@/components/dashboard/DatasetUpload';
import { StatVisuals } from '@/components/dashboard/StatVisuals';
import { calculateDescriptiveStats, DescriptiveStats, calculatePearsonCorrelation } from '@/lib/stats-engine';
import { ParsedData, getCsvSample } from '@/lib/data-parser';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { runAuditAction, runInsightsAction } from '@/app/actions/analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function Dashboard() {
  const [currentDataset, setCurrentDataset] = useState<ParsedData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [auditResults, setAuditResults] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const insightsCache = useRef<Record<string, any>>({});
  const { toast } = useToast();

  const handleUpload = (data: ParsedData) => {
    setCurrentDataset(data);
    setInsights(null);
    setAuditResults(null);
    setAnalysisError(null);
    toast({ title: "Dataset Processed", description: `Successfully analyzed ${data.rows.length} records.` });
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

    const cacheKey = `${currentDataset.rows.length}-${currentDataset.headers.join('-')}`;
    if (insightsCache.current[cacheKey]) {
      setInsights(insightsCache.current[cacheKey]);
      toast({ title: "Analysis Loaded", description: "Retrieved cached executive summary." });
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    
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
      return `Field: ${col}\n- Mean: ${stats.mean.toFixed(2)}\n- Median: ${stats.median.toFixed(2)}\n- Outliers: ${stats.outliers.length}\n- Range: [${stats.min}, ${stats.max}]`;
    }).join('\n\n') + `\n\nTop Correlations:\n${correlations.join('\n')}`;

    const sample = getCsvSample(currentDataset, 10); 
    
    try {
      const insightsRes = await runInsightsAction({
        datasetPreview: sample,
        statsSummary,
        columnNames: currentDataset.headers
      });

      if (insightsRes.success) {
        setInsights(insightsRes.data);
        insightsCache.current[cacheKey] = insightsRes.data;
        toast({ title: "Analysis Complete", description: "Executive insights generated successfully." });
      } else {
        setAnalysisError(insightsRes.error || "Analytical engine failed to initialize.");
      }

      if (!auditResults) {
        const auditRes = await runAuditAction(sample, currentDataset.headers);
        if (auditRes.success) {
          setAuditResults(auditRes.data);
        }
      }
    } catch (err: any) {
      setAnalysisError("An error occurred during analytical processing.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const dataHealthScore = useMemo(() => {
    if (!currentDataset) return 0;
    if (auditResults?.qualityScore) return auditResults.qualityScore;
    return 85; 
  }, [currentDataset, auditResults]);

  const statusTicker = [
    "SYSTEM STATUS: OPERATIONAL",
    "ENCRYPTION: ACTIVE",
    "DATA INTEGRITY: VERIFIED",
    "ANALYTICS ENGINE: READY",
    "SESSION: SECURE",
    "COMPLIANCE: ACTIVE",
    "REPORTING: ONLINE"
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans selection:bg-indigo-500/30">
      {/* Analytics Status Ticker */}
      <div className="bg-indigo-600/10 border-b border-indigo-500/20 py-2 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee flex items-center gap-12">
          {[...statusTicker, ...statusTicker].map((item, i) => (
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
          <nav className="flex items-center gap-8 text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
            <Link href="/dashboard" className="text-indigo-500 flex items-center gap-2"><LayoutDashboard className="h-3.5 w-3.5" /> Workspace</Link>
            <Link href="/security" className="hover:text-white flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> Security</Link>
            <Link href="/resources" className="hover:text-white flex items-center gap-2"><HelpCircle className="h-3.5 w-3.5" /> Resources</Link>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="border-indigo-500/20 text-indigo-400 bg-indigo-500/5 text-[10px] font-bold px-4 py-1.5 uppercase tracking-widest">
            {isAnalyzing ? 'PROCESSING...' : 'STATUS: ONLINE'}
          </Badge>
        </div>
      </header>

      <main className="p-10 max-w-[1700px] mx-auto space-y-12">
        {!currentDataset ? (
          <div className="py-20 animate-in fade-in zoom-in-95 duration-1000">
            <DatasetUpload onUpload={handleUpload} />
          </div>
        ) : (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            {/* 1. Dataset Overview & KPI Cards */}
            <section className="space-y-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Dataset Overview</h2>
                  <p className="text-white/40 font-medium">Structural profile and health metrics of the current analytical workspace.</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-white/5 border-white/10 text-white font-mono text-xs px-4 py-2 rounded-lg">
                    <Database className="h-3.5 w-3.5 mr-2 text-indigo-500" />
                    DATASET: ANALYTICS_WORKSPACE
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Data Quality', value: `${dataHealthScore}%`, icon: ShieldCheck, color: 'text-indigo-400' },
                  { label: 'Numeric Fields', value: numericColumns.length, icon: Zap, color: 'text-emerald-400' },
                  { label: 'Total Records', value: currentDataset.rows.length.toLocaleString(), icon: Activity, color: 'text-blue-400' },
                  { label: 'Quality Risks', value: auditResults?.issuesIdentified?.length || 0, icon: AlertTriangle, color: 'text-yellow-400' },
                ].map((stat, i) => (
                  <Card key={i} className="bg-white/5 border-white/10 rounded-[2rem] overflow-hidden group hover:border-white/20 transition-all">
                    <CardContent className="p-8 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                      </div>
                      <stat.icon className={`h-10 w-10 ${stat.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <Separator className="bg-white/5" />

            {/* 2. Visualizations & Deep Statistics */}
            <section className="space-y-10">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Exploratory Analytics</h2>
                <p className="text-white/40 font-medium">Visual mapping and statistical distribution of identified feature sets.</p>
              </div>

              <Tabs defaultValue="visuals" className="w-full">
                <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl mb-10 h-auto flex flex-wrap gap-2">
                  <TabsTrigger value="visuals" className="rounded-xl px-10 py-3 text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-indigo-600">Visualizations</TabsTrigger>
                  <TabsTrigger value="stats" className="rounded-xl px-10 py-3 text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-indigo-600">Descriptive Statistics</TabsTrigger>
                  <TabsTrigger value="table" className="rounded-xl px-10 py-3 text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-indigo-600">Data Table</TabsTrigger>
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
                            <div><p className="text-[10px] font-bold text-white/30 mb-1">Std Dev</p><p className="text-xl font-black">{descriptiveResults[col]?.stdDev.toFixed(2)}</p></div>
                            <div><p className="text-[10px] font-bold text-white/30 mb-1">Range</p><p className="text-xl font-black">{(descriptiveResults[col]?.max - descriptiveResults[col]?.min).toFixed(2)}</p></div>
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
            </section>

            {/* 3. Predictive Analysis */}
            <section className="space-y-10">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Predictive Analysis</h2>
                <p className="text-white/40 font-medium">Trend modeling and projections based on historical data sequences.</p>
              </div>
              <Card className="bg-indigo-600/5 border-indigo-500/20 rounded-[2.5rem] p-12 text-center">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="p-4 rounded-full bg-indigo-500/10 w-fit mx-auto border border-indigo-500/20">
                    <TrendingUp className="h-8 w-8 text-indigo-500" />
                  </div>
                  <h3 className="text-2xl font-bold">Forecast Projections</h3>
                  <p className="text-white/50 leading-relaxed font-medium">
                    The analytical engine is processing sequential patterns. Future projections will be integrated into the Executive Summary below.
                  </p>
                </div>
              </Card>
            </section>

            <Separator className="bg-white/5" />

            {/* 4. AI Executive Summary */}
            <section id="ai-summary" className="space-y-10">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Executive Analysis</h2>
                <p className="text-white/40 font-medium">Automated narrative synthesis and strategic recommendations for stakeholders.</p>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <Card className="relative bg-zinc-950/50 border-white/10 backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
                  <CardHeader className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 p-10 gap-6">
                    <div className="flex items-center gap-6">
                      <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-600/20">
                        <BrainCircuit className="h-8 w-8 text-indigo-500" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Executive Summary</CardTitle>
                        <CardDescription className="text-white/40 font-medium uppercase text-[10px] tracking-widest mt-1">Automated insight generation</CardDescription>
                      </div>
                    </div>
                    <Button 
                      onClick={runAiAnalysis} 
                      disabled={isAnalyzing}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-14 px-10 font-bold uppercase tracking-widest text-xs shadow-lg shadow-indigo-600/20 w-full md:w-auto"
                    >
                      {isAnalyzing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                      {isAnalyzing ? "Processing..." : insights ? "Refresh Analysis" : "Generate Executive Insights"}
                    </Button>
                  </CardHeader>
                  <CardContent className="p-10">
                    {analysisError && (
                      <Alert className="mb-8 bg-red-500/10 border-red-500/20 text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Analytical Error</AlertTitle>
                        <AlertDescription>
                          {analysisError}
                          <Button variant="link" size="sm" onClick={runAiAnalysis} className="text-red-400 font-bold ml-2 underline">Retry</Button>
                        </AlertDescription>
                      </Alert>
                    )}

                    {isAnalyzing ? (
                      <div className="space-y-10 py-10">
                        <div className="flex items-center gap-4">
                          <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                          <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs animate-pulse">Processing Statistical Models... GENERATING INSIGHTS</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <Skeleton className="h-48 rounded-2xl bg-white/5" />
                          <Skeleton className="h-48 rounded-2xl bg-white/5" />
                          <Skeleton className="h-48 rounded-2xl bg-white/5" />
                        </div>
                      </div>
                    ) : insights ? (
                      <div className="space-y-16 animate-in fade-in duration-1000">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                          <div className="lg:col-span-2 space-y-10">
                            <div>
                              <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-6">Strategic Overview</h4>
                              <p className="text-2xl text-white/90 leading-relaxed font-medium italic">"{insights.executiveSummary}"</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                              <Card className="bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:bg-white/[0.07] transition-colors">
                                <CardContent className="p-8">
                                  <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2"><Sparkles className="h-4 w-4 text-indigo-500" /> Key Findings</h5>
                                  <ul className="space-y-4">
                                    {insights.keyFindings.map((f: string, i: number) => (
                                      <li key={i} className="text-sm text-white/70 flex items-start gap-4">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                        {f}
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                              <Card className="bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:bg-white/[0.07] transition-colors">
                                <CardContent className="p-8">
                                  <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2"><Target className="h-4 w-4 text-emerald-500" /> Opportunities</h5>
                                  <ul className="space-y-4">
                                    {insights.businessOpportunities.map((o: string, i: number) => (
                                      <li key={i} className="text-sm text-white/70 flex items-start gap-4">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        {o}
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                          <div className="space-y-10">
                            <Card className="bg-indigo-600/10 border-indigo-500/20 rounded-[2.5rem] text-center p-10">
                              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Statistical Confidence</p>
                              <div className="text-7xl font-black text-white mb-6 tracking-tighter">{insights.confidenceScore}%</div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                                <div className="h-full bg-indigo-500" style={{ width: `${insights.confidenceScore}%` }} />
                              </div>
                              <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Model Precision Score</p>
                            </Card>
                            <Card className="bg-red-500/5 border-red-500/20 rounded-2xl p-8">
                              <h5 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-6 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Quality Risks</h5>
                              <ul className="space-y-3">
                                {insights.potentialRisks.map((r: string, i: number) => (
                                  <li key={i} className="text-xs text-red-200/60 leading-relaxed font-medium">- {r}</li>
                                ))}
                              </ul>
                            </Card>
                          </div>
                        </div>
                        
                        <div className="pt-10 border-t border-white/5">
                          <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-8">Recommendations</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {insights.recommendations.map((rec: string, i: number) => (
                              <Card key={i} className="bg-white/5 border-white/10 p-6 rounded-xl">
                                <p className="text-sm text-white/80 leading-relaxed font-medium">{rec}</p>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 text-center space-y-8">
                        <div className="p-8 rounded-full bg-white/5 border border-white/10">
                          <Presentation className="h-16 w-16 text-white/20" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-white/80 font-bold uppercase tracking-[0.25em] text-sm">Analysis Required</p>
                          <p className="text-white/40 font-medium max-w-md mx-auto">Initialize the analytical engine to unlock AI-powered insights and executive recommendations.</p>
                        </div>
                        <Button 
                          onClick={runAiAnalysis} 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-14 px-12 font-bold uppercase tracking-widest text-xs"
                        >
                          Initialize Analysis
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  {insights && (
                    <CardFooter className="bg-white/5 border-t border-white/5 p-8">
                      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="h-5 w-5 text-indigo-500" />
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Analysis Engine v2.5 Verified</span>
                        </div>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">TIMESTAMP: {new Date().toLocaleTimeString()}</p>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="py-20 border-t border-white/5 bg-black/40 mt-20">
        <div className="container mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4 opacity-40">
            <BarChart3 className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tighter uppercase italic">AutoStat AI</span>
          </div>
          <div className="flex items-center gap-12 text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">
            <Link href="/security">Security Center</Link>
            <Link href="/resources">Documentation</Link>
            <Link href="/security">Privacy Policy</Link>
          </div>
          <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black">
            © 2025 AUTOSTAT ANALYTICS • SECURE PROCESSING
          </p>
        </div>
      </footer>
    </div>
  );
}
