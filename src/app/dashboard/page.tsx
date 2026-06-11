"use client"

import React, { useState, useMemo, useRef } from 'react';
import { 
  BarChart3, ShieldCheck, Zap, Loader2, RefreshCw,
  AlertTriangle, Target, Activity, Database, 
  Presentation, Download, Share2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DatasetUpload } from '@/components/dashboard/DatasetUpload';
import { StatVisuals } from '@/components/dashboard/StatVisuals';
import { 
  calculateDescriptiveStats, 
  DescriptiveStats, 
  calculatePearsonCorrelation,
  calculateLocalDataQuality,
  projectLocalTrend
} from '@/lib/stats-engine';
import { ParsedData } from '@/lib/data-parser';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { runInsightsAction } from '@/app/actions/analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

/**
 * Professional Analytics Dashboard.
 * - Single-column layout for focused ingestion.
 * - Strict conditional rendering (no empty chart containers).
 * - Groq-powered AI Strategic Synthesis.
 */
export default function Dashboard() {
  const [currentDataset, setCurrentDataset] = useState<ParsedData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const insightsCache = useRef<Record<string, any>>({});
  const { toast } = useToast();

  const handleUpload = (data: ParsedData) => {
    setCurrentDataset(data);
    setInsights(null);
    setAnalysisError(null);
    toast({ title: "Dataset Ingested", description: `Processed ${data.rows.length} records locally.` });
  };

  const numericColumns = currentDataset ? Object.keys(currentDataset.columnTypes).filter(h => currentDataset.columnTypes[h] === 'number') : [];
  const categoricalColumns = currentDataset ? Object.keys(currentDataset.columnTypes).filter(h => currentDataset.columnTypes[h] === 'string') : [];

  const descriptiveResults = useMemo(() => {
    if (!currentDataset) return {};
    const results: Record<string, DescriptiveStats> = {};
    numericColumns.forEach(col => {
      const vals = currentDataset.rows.map(r => r[col]).filter(v => typeof v === 'number');
      if (vals.length > 0) {
        results[col] = calculateDescriptiveStats(vals);
      }
    });
    return results;
  }, [currentDataset, numericColumns]);

  const dataAudit = useMemo(() => {
    if (!currentDataset) return { qualityScore: 0, issuesIdentified: [], missingValues: 0 };
    return calculateLocalDataQuality(currentDataset.rows, currentDataset.headers);
  }, [currentDataset]);

  const runAiAnalysis = async () => {
    if (!currentDataset || isAnalyzing) return;

    const cacheKey = `${currentDataset.rows.length}-${currentDataset.headers.join('-')}`;
    if (insightsCache.current[cacheKey]) {
      setInsights(insightsCache.current[cacheKey]);
      setAnalysisError(null);
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);

    // AI Payload Preparation (Reduced to minimize token usage)
    const topCorrelations: string[] = [];
    if (numericColumns.length >= 2) {
      for (let i = 0; i < Math.min(numericColumns.length, 5); i++) {
        for (let j = i + 1; j < Math.min(numericColumns.length, 5); j++) {
          const c1 = numericColumns[i];
          const c2 = numericColumns[j];
          const x = currentDataset.rows.map(r => r[c1]).filter(v => typeof v === 'number');
          const y = currentDataset.rows.map(r => r[c2]).filter(v => typeof v === 'number');
          const r = calculatePearsonCorrelation(x, y);
          if (Math.abs(r) > 0.4) {
            topCorrelations.push(`${c1} vs ${c2}: ${r.toFixed(2)}`);
          }
        }
      }
    }

    const outlierCounts: Record<string, number> = {};
    numericColumns.slice(0, 5).forEach(col => {
      outlierCounts[col] = descriptiveResults[col]?.outliers.length || 0;
    });

    const firstNumCol = numericColumns[0];
    let forecastSummary = "Stable";
    if (firstNumCol) {
      const series = currentDataset.rows.map(r => r[firstNumCol]).filter(v => typeof v === 'number');
      const projection = projectLocalTrend(series, 5);
      const delta = ((projection[4] - projection[0]) / (Math.abs(projection[0]) || 1)) * 100;
      forecastSummary = `${delta > 0 ? 'Upward' : 'Downward'} trend ~${Math.abs(delta).toFixed(1)}%`;
    }

    const statsMetricsStr = Object.entries(descriptiveResults).slice(0, 3).map(([col, stats]) => {
      return `${col}: μ=${stats.mean.toFixed(1)}, Range=[${stats.min}-${stats.max}]`;
    }).join('; ');

    try {
      const res = await runInsightsAction({
        datasetSummary: {
          rowCount: currentDataset.rows.length,
          columnCount: currentDataset.headers.length,
          columnNames: currentDataset.headers.slice(0, 10),
          missingValues: dataAudit.missingValues,
          qualityScore: dataAudit.qualityScore
        },
        statsMetrics: statsMetricsStr,
        topCorrelations: topCorrelations.slice(0, 3),
        outlierCounts,
        forecastTrajectory: forecastSummary
      });

      if (res.success) {
        setInsights(res.data);
        insightsCache.current[cacheKey] = res.data;
      } else {
        setAnalysisError(res.error);
      }
    } catch (err: any) {
      setAnalysisError("Analytical engine encountered a communication error.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans selection:bg-indigo-500/30">
      <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <BarChart3 className="text-white h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight uppercase">AutoStat AI</span>
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <nav className="flex items-center gap-8 text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
            <Link href="/dashboard" className="text-indigo-500">Dashboard</Link>
            <Link href="/security" className="hover:text-white">Security</Link>
            <Link href="/resources" className="hover:text-white">Resources</Link>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/5 text-[10px] font-bold px-4 py-1.5 uppercase tracking-widest">
            Local Engine: Active
          </Badge>
        </div>
      </header>

      <main className="p-10 max-w-[1700px] mx-auto space-y-12 pb-32">
        {!currentDataset ? (
          <div className="py-20 animate-in fade-in zoom-in-95 duration-1000">
            <DatasetUpload onUpload={handleUpload} />
          </div>
        ) : (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            {/* 1. Dataset Overview */}
            <section className="space-y-10">
              <div className="text-center">
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Automated Data Profiling</h2>
                <p className="text-white/40 font-medium italic">Instant local calculation of structural and mathematical health metrics.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Data Health', value: `${dataAudit.qualityScore}%`, icon: ShieldCheck, color: 'text-indigo-400' },
                  { label: 'Feature Count', value: currentDataset.headers.length, icon: Zap, color: 'text-emerald-400' },
                  { label: 'Total Records', value: currentDataset.rows.length.toLocaleString(), icon: Activity, color: 'text-blue-400' },
                  { label: 'Missing Values', value: dataAudit.missingValues, icon: AlertTriangle, color: 'text-yellow-400' },
                ].map((stat, i) => (
                  <Card key={i} className="bg-white/5 border-white/10 rounded-[2rem] group hover:border-white/20 transition-all">
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

            {/* 2. Exploratory Analytics */}
            <section className="space-y-10">
              <div className="text-center">
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Exploratory Analytics</h2>
                <p className="text-white/40 font-medium italic">Interactive visualization and distribution analysis calculated in-browser.</p>
              </div>

              <Tabs defaultValue="visuals" className="w-full">
                <div className="flex justify-center mb-10">
                  <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl h-auto">
                    <TabsTrigger value="visuals" className="rounded-xl px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-indigo-600">Visualizations</TabsTrigger>
                    <TabsTrigger value="stats" className="rounded-xl px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-indigo-600">Statistical Summary</TabsTrigger>
                    <TabsTrigger value="table" className="rounded-xl px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-indigo-600">Dataset Preview</TabsTrigger>
                  </TabsList>
                </div>
                
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
                            <div><p className="text-[10px] font-bold text-white/30 mb-1">Outliers</p><p className="text-xl font-black text-yellow-500">{descriptiveResults[col]?.outliers.length}</p></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="table" className="mt-0 outline-none">
                  <Card className="bg-white/5 border-white/10 rounded-[2rem] overflow-hidden">
                    <div className="overflow-x-auto max-h-[500px]">
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

            <Separator className="bg-white/5" />

            {/* 3. AI Executive Analysis */}
            <section id="ai-insights" className="space-y-10">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Executive Analysis</h2>
                <p className="text-white/40 font-medium italic max-w-2xl mx-auto">High-fidelity interpretation of local statistics synthesized into strategic business insights by our analytical engine.</p>
              </div>

              <div className="relative group max-w-6xl mx-auto">
                <Card className="relative bg-zinc-950/50 border-white/10 backdrop-blur-xl rounded-[2.5rem] min-h-[400px] flex flex-col justify-center">
                  <CardContent className="p-10">
                    {isAnalyzing ? (
                      <div className="space-y-10 py-10 text-center flex flex-col items-center">
                        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-6" />
                        <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-sm animate-pulse">Synthesizing Statistical Narrative...</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-12">
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
                              <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-6">Strategic Narrative</h4>
                              <p className="text-2xl text-white/90 leading-relaxed font-medium italic">"{insights.executiveSummary}"</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                              <Card className="bg-white/5 border-white/10 rounded-2xl p-8">
                                <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2"><Activity className="h-4 w-4 text-indigo-500" /> Key Findings</h5>
                                <ul className="space-y-4">
                                  {insights.keyFindings.map((f: string, i: number) => (
                                    <li key={i} className="text-sm text-white/70 flex items-start gap-4">
                                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                      {f}
                                    </li>
                                  ))}
                                </ul>
                              </Card>
                              <Card className="bg-white/5 border-white/10 rounded-2xl p-8">
                                <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2"><Target className="h-4 w-4 text-emerald-500" /> Business Opportunities</h5>
                                <ul className="space-y-4">
                                  {insights.businessOpportunities.map((o: string, i: number) => (
                                    <li key={i} className="text-sm text-white/70 flex items-start gap-4">
                                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                      {o}
                                    </li>
                                  ))}
                                </ul>
                              </Card>
                            </div>
                          </div>
                          <div className="space-y-10">
                            <Card className="bg-indigo-600/10 border-indigo-500/20 rounded-[2.5rem] text-center p-10">
                              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Statistical Confidence</p>
                              <div className="text-7xl font-black text-white mb-6 tracking-tighter">{insights.confidenceScore}%</div>
                              <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Model Precision Score</p>
                            </Card>
                            <Button 
                              variant="outline" 
                              onClick={runAiAnalysis}
                              className="w-full border-white/5 hover:bg-white/5 rounded-xl h-12 text-[10px] uppercase font-bold tracking-widest"
                            >
                              <RefreshCw className="mr-2 h-3 w-3" /> Re-interpret Metrics
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 text-center space-y-8">
                        {analysisError ? (
                          <div className="space-y-6">
                            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto" />
                            <div className="space-y-2">
                              <p className="text-white/80 font-bold uppercase tracking-[0.25em] text-sm">Analytical Logic Paused</p>
                              <p className="text-white/40 font-medium max-w-md mx-auto">{analysisError}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              onClick={runAiAnalysis} 
                              className="border-indigo-500 text-indigo-400 font-bold uppercase tracking-widest text-xs px-8 h-12 rounded-xl"
                            >
                              Retry Analysis
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="p-8 rounded-full bg-white/5 border border-white/10">
                              <Presentation className="h-16 w-16 text-white/20" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-white/80 font-bold uppercase tracking-[0.25em] text-sm">Interpretation Required</p>
                              <p className="text-white/40 font-medium max-w-md mx-auto">Click below to send locally calculated summaries to the AI engine for executive synthesis.</p>
                            </div>
                            <Button 
                              onClick={runAiAnalysis} 
                              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-16 px-12 font-bold uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20"
                            >
                              Generate AI Insights
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator className="bg-white/5" />

            {/* 4. Export & Share */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-10 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                <div className="space-y-2">
                  <h4 className="text-xl font-black uppercase tracking-tighter">Analytics Report</h4>
                  <p className="text-white/30 text-xs font-medium">Export a full analytical summary of statistical metrics and forecasts.</p>
                </div>
                <Button variant="outline" className="border-white/10 group-hover:bg-white/10 rounded-xl h-12 px-8 font-bold text-[10px] uppercase tracking-widest">
                  <Download className="mr-2 h-4 w-4" /> Export Report
                </Button>
              </Card>
              <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-10 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                <div className="space-y-2">
                  <h4 className="text-xl font-black uppercase tracking-tighter">Share Analysis</h4>
                  <p className="text-white/30 text-xs font-medium">Create a secure link to share this workspace with stakeholders.</p>
                </div>
                <Button variant="outline" className="border-white/10 group-hover:bg-white/10 rounded-xl h-12 px-8 font-bold text-[10px] uppercase tracking-widest">
                  <Share2 className="mr-2 h-4 w-4" /> Copy Share Link
                </Button>
              </Card>
            </section>
          </div>
        )}
      </main>

      <footer className="py-20 border-t border-white/5 bg-black/40">
        <div className="container mx-auto px-10 flex flex-col md:flex-row justify-between items-start gap-12 text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-4 opacity-40">
              <BarChart3 className="h-6 w-6" />
              <span className="font-bold text-xl tracking-tighter uppercase italic text-white">AutoStat AI</span>
            </div>
            <p className="text-[10px] text-white/20 max-w-sm leading-relaxed">
              AutoStat AI is a professional data analytics platform for statistical profiling, forecasting, and automated business reporting.
            </p>
          </div>
          <div className="flex flex-wrap gap-12 text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">
            <div className="flex flex-col gap-4">
              <p className="text-indigo-500 opacity-60">Legal</p>
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white">Terms of Use</Link>
              <Link href="/disclaimer" className="hover:text-white">Disclaimer</Link>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-indigo-500 opacity-60">Platform</p>
              <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
              <Link href="/resources" className="hover:text-white">Resources</Link>
            </div>
          </div>
          <div className="md:text-right space-y-2">
            <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black">
              © 2025 AUTOSTAT ANALYTICS
            </p>
            <p className="text-[10px] text-white/10 uppercase tracking-[0.2em] font-bold">
              v2.5.0 STABLE • LOCAL PROCESSING
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
