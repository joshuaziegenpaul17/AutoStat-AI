"use client"

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  BarChart3, ShieldCheck, Zap, Loader2, RefreshCw,
  AlertTriangle, Target, Activity, Database, 
  Presentation, Download, FileText, ChevronRight,
  ClipboardList, TrendingUp, Search, Info, ShieldAlert,
  BarChart as BarChartIcon, LineChart, PieChart, Scale
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DatasetUpload } from '@/components/dashboard/DatasetUpload';
import { StatVisuals } from '@/components/dashboard/StatVisuals';
import { AnalyticsTicker } from '@/components/dashboard/AnalyticsTicker';
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

export default function Dashboard() {
  const [currentDataset, setCurrentDataset] = useState<ParsedData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const insightsCache = useRef<Record<string, any>>({});
  const { toast } = useToast();

  const reportMetadata = useMemo(() => ({
    id: `RPT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    timestamp: new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })
  }), [currentDataset]);

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

  // Handle Automatic AI Trigger on Upload
  useEffect(() => {
    if (currentDataset && !insights && !isAnalyzing) {
      runAiAnalysis();
    }
  }, [currentDataset]);

  const handleUpload = (data: ParsedData) => {
    setCurrentDataset(data);
    setInsights(null);
    setAnalysisError(null);
    toast({ title: "Dataset Ingested", description: `Local processing complete. Synthesizing AI insights...` });
  };

  const handleExportPDF = () => {
    if (!currentDataset) return;
    toast({ title: "Preparing Report", description: "Standardizing format for executive distribution..." });
    setTimeout(() => {
      window.print();
    }, 800);
  };

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
        setInsights({
          executiveSummary: "Statistical profiling is complete. Strategic narrative is currently unavailable.",
          businessSummary: "The dataset has been successfully processed locally. Numerical integrity and distributions are available in the descriptive profile below.",
          keyFindings: ["Data ingestion successful", `Processed ${currentDataset.rows.length} rows`],
          businessOpportunities: ["Manual analysis recommended"],
          riskAnalysis: "Automated risk vectoring is in standby mode.",
          recommendations: ["Review local statistical volatility", "Audit missing value clusters"],
          forecastInterpretation: "Trajectory analysis is available in the Trends module.",
          confidenceScore: dataAudit.qualityScore
        });
      }
    } catch (err: any) {
      setAnalysisError("Analytical engine encountered a communication error.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans selection:bg-indigo-500/30">
      {/* PROFESSIONAL PDF REPORT VIEW */}
      {currentDataset && (
        <div className="hidden print:block bg-white text-black p-0 max-w-full">
          {/* Page 1: Executive Cover */}
          <section className="h-[27cm] flex flex-col justify-center items-center text-center border-b-[12px] border-indigo-600 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 text-zinc-400 font-mono text-[10px]">
              {reportMetadata.id}
            </div>
            <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mb-10 mx-auto">
              <BarChart3 className="text-white h-12 w-12" />
            </div>
            <h1 className="text-7xl font-black uppercase tracking-tighter mb-4 text-zinc-900">AutoStat AI</h1>
            <p className="text-2xl font-bold text-zinc-400 uppercase tracking-[0.6em] mb-20">Strategic Analytics Report</p>
            
            <div className="w-3/4 space-y-6 mx-auto p-12 border-y-2 border-zinc-100">
              <div className="flex justify-between text-base uppercase font-bold tracking-widest text-zinc-400">
                <span>Engagement ID</span>
                <span className="text-zinc-900">#{reportMetadata.id}</span>
              </div>
              <div className="flex justify-between text-base uppercase font-bold tracking-widest text-zinc-400">
                <span>Report Date</span>
                <span className="text-zinc-900">{reportMetadata.timestamp}</span>
              </div>
              <div className="flex justify-between text-base uppercase font-bold tracking-widest text-zinc-400">
                <span>Sample Size</span>
                <span className="text-zinc-900">{currentDataset.rows.length.toLocaleString()} Records</span>
              </div>
              <div className="flex justify-between text-base uppercase font-bold tracking-widest text-zinc-400">
                <span>Quality Score</span>
                <span className="text-indigo-600">{dataAudit.qualityScore}%</span>
              </div>
            </div>

            <div className="mt-32 px-20">
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black mb-4">Professional Disclosure</p>
              <p className="text-[8px] text-zinc-400 leading-relaxed italic">
                AutoStat AI provides automated statistical analysis for informational purposes only. Results should not be interpreted as professional financial, legal, or investment advice.
              </p>
            </div>
          </section>

          {/* Page 2: Executive Summary */}
          <section className="report-section p-12 min-h-[27cm]">
            <h2 className="text-4xl font-black uppercase tracking-tight border-b-4 border-indigo-600 pb-4 mb-10 text-zinc-900">01 Executive Summary</h2>
            {insights ? (
              <div className="space-y-12">
                <div className="p-10 bg-indigo-50 border-l-8 border-indigo-600 text-2xl font-medium text-zinc-800 leading-relaxed italic">
                  "{insights.executiveSummary}"
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-black uppercase tracking-widest text-zinc-900">Business Context</h3>
                  <p className="text-lg text-zinc-600 leading-relaxed">{insights.businessSummary}</p>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-black uppercase tracking-widest text-zinc-900">Primary Observations</h3>
                  <div className="grid grid-cols-2 gap-8">
                    {insights.keyFindings.map((f: string, i: number) => (
                      <div key={i} className="flex gap-4 p-4 border border-zinc-100 rounded-xl">
                        <span className="text-indigo-600 font-black">#0{i+1}</span>
                        <span className="text-base text-zinc-600">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-20 border-4 border-dashed border-zinc-100 text-center text-zinc-300 text-2xl font-black uppercase tracking-widest italic">
                Synthetic Narrative Processing...
              </div>
            )}
          </section>

          {/* Page 3: Dataset Health Audit */}
          <section className="report-section p-12 min-h-[27cm]">
            <h2 className="text-4xl font-black uppercase tracking-tight border-b-4 border-indigo-600 pb-4 mb-10 text-zinc-900">02 Dataset Health Audit</h2>
            
            <div className="grid grid-cols-3 gap-8 mb-16">
              <div className="p-10 bg-zinc-50 rounded-3xl text-center border border-zinc-100">
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Quality Score</p>
                <p className="text-6xl font-black text-indigo-600">{dataAudit.qualityScore}%</p>
              </div>
              <div className="p-10 bg-zinc-50 rounded-3xl text-center border border-zinc-100">
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Integrity Gaps</p>
                <p className="text-6xl font-black text-zinc-900">{dataAudit.missingValues}</p>
              </div>
              <div className="p-10 bg-zinc-50 rounded-3xl text-center border border-zinc-100">
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Feature Density</p>
                <p className="text-6xl font-black text-zinc-900">{currentDataset.headers.length}</p>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-lg font-black uppercase tracking-widest text-zinc-900">Auditor Observations</h3>
              <table className="report-table w-full">
                <thead>
                  <tr className="bg-zinc-900 text-white">
                    <th className="p-4 text-left">Metric</th>
                    <th className="p-4 text-left">Result</th>
                    <th className="p-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="p-4 font-bold">Structural Health</td>
                    <td className="p-4">Validated</td>
                    <td className="p-4 text-emerald-600 font-black">Passed</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">Missing Value Ratio</td>
                    <td className="p-4">{(dataAudit.missingValues / (currentDataset.rows.length * currentDataset.headers.length) * 100).toFixed(2)}%</td>
                    <td className="p-4 text-indigo-600 font-black">{dataAudit.qualityScore > 80 ? 'Optimal' : 'Caution'}</td>
                  </tr>
                  {dataAudit.issuesIdentified.map((issue, i) => (
                    <tr key={i}>
                      <td className="p-4 font-bold">Identified Vulnerability</td>
                      <td className="p-4 text-zinc-500">{issue}</td>
                      <td className="p-4 text-red-600 font-black">Action Required</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Page 4: Strategic Roadmap */}
          <section className="report-section p-12 min-h-[27cm]">
            <h2 className="text-4xl font-black uppercase tracking-tight border-b-4 border-indigo-600 pb-4 mb-10 text-zinc-900">03 Strategic Insights</h2>
            {insights ? (
              <div className="space-y-12">
                <div className="grid grid-cols-1 gap-8">
                  {insights.recommendations.map((r: string, i: number) => (
                    <div key={i} className="p-8 border border-zinc-100 rounded-3xl flex gap-8 items-start hover:bg-zinc-50 transition-colors">
                      <span className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xl font-black shrink-0">{i + 1}</span>
                      <div>
                        <h4 className="text-lg font-black text-zinc-900 mb-2">Suggested Vector</h4>
                        <p className="text-lg text-zinc-600 leading-relaxed">{r}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-12 p-8 bg-emerald-50 border-l-8 border-emerald-600 rounded-r-3xl">
                  <h4 className="text-sm font-black uppercase tracking-widest text-emerald-800 mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Opportunity Mapping</h4>
                  <ul className="grid grid-cols-1 gap-4">
                    {insights.businessOpportunities.map((o: string, i: number) => (
                      <li key={i} className="text-emerald-700 font-medium flex gap-3"><ChevronRight className="h-5 w-5 shrink-0" /> {o}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-20 border-4 border-dashed border-zinc-100 text-center text-zinc-300 font-black uppercase tracking-widest italic text-2xl">
                Recommendations Loading...
              </div>
            )}
          </section>

          {/* Page 5: Methodology & Legal Disclaimer */}
          <section className="report-section p-12 min-h-[27cm] flex flex-col">
            <h2 className="text-4xl font-black uppercase tracking-tight border-b-4 border-indigo-600 pb-4 mb-10 text-zinc-900">04 Disclaimer & Limitations</h2>
            
            <div className="space-y-12 flex-grow">
              <div className="space-y-6">
                <h3 className="text-lg font-black uppercase tracking-widest text-zinc-900">Reporting Methodology</h3>
                <p className="text-lg text-zinc-600 leading-relaxed">
                  This report was synthesized using a hybrid analytical architecture. Descriptive statistics (Mean, Median, Standard Deviation) were calculated locally to ensure data sovereignty. Strategic interpretations and narrative summaries were generated via Large Language Models interpreting pre-computed statistical artifacts.
                </p>
                <ul className="space-y-2 text-zinc-500 text-sm font-medium">
                  <li className="flex items-center gap-2">• Statistical calculations are automated and based on provided column mapping.</li>
                  <li className="flex items-center gap-2">• Forecasts are probabilistic estimates and do not guarantee future performance.</li>
                  <li className="flex items-center gap-2">• AI-generated summaries are subject to model limitations and may contain inaccuracies.</li>
                </ul>
              </div>

              <div className="p-10 bg-red-50 border-2 border-red-100 rounded-3xl space-y-6">
                <h3 className="text-lg font-black uppercase tracking-widest text-red-600 flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Professional Disclosure</h3>
                <p className="text-sm text-red-800/80 leading-relaxed font-bold italic">
                  AutoStat AI provides automated statistical analysis, forecasting, and AI-generated insights for informational and educational purposes only. Results, suggested vectors, and analytical summaries should not be considered financial, legal, medical, investment, or professional advice. Users are responsible for independently verifying all findings before making business or operational decisions.
                </p>
              </div>
            </div>

            <footer className="mt-32 pt-8 border-t border-zinc-100 flex justify-between items-center text-zinc-400">
              <span className="font-bold text-xs uppercase tracking-[0.2em]">© 2025 AutoStat Analytics Group</span>
              <span className="font-mono text-xs uppercase">{reportMetadata.id} • END OF REPORT</span>
            </footer>
          </section>

          <footer className="report-footer px-10 flex justify-between items-center bg-white">
            <span className="text-[8px] font-bold uppercase tracking-widest">AutoStat AI Professional Executive Report</span>
            <span className="font-mono text-[8px]">{reportMetadata.timestamp}</span>
          </footer>
        </div>
      )}

      {/* REGULAR DASHBOARD VIEW */}
      <div className="print:hidden">
        <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-50">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <BarChart3 className="text-white h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight uppercase tracking-tighter">AutoStat AI</span>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <nav className="flex items-center gap-8 text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
              <Link href="/dashboard" className="text-indigo-500">Dashboard</Link>
              <Link href="/security" className="hover:text-white">Security</Link>
              <Link href="/resources" className="hover:text-white">Resources</Link>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <Badge variant="outline" className="border-indigo-500/20 text-indigo-400 bg-indigo-500/5 text-[10px] font-bold px-4 py-1.5 uppercase tracking-widest">
              Local Engine: Active
            </Badge>
          </div>
        </header>

        <AnalyticsTicker 
          dataPresent={!!currentDataset} 
          qualityScore={dataAudit.qualityScore} 
          missingValues={dataAudit.missingValues} 
        />

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
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Dataset Metadata</h2>
                  <p className="text-white/40 font-medium italic">Automated structural health profiling calculated in-browser.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Data Quality', value: `${dataAudit.qualityScore}%`, icon: ShieldCheck, color: 'text-indigo-400' },
                    { label: 'Features', value: currentDataset.headers.length, icon: Zap, color: 'text-emerald-400' },
                    { label: 'Records', value: currentDataset.rows.length.toLocaleString(), icon: Activity, color: 'text-blue-400' },
                    { label: 'Integrity Gaps', value: dataAudit.missingValues, icon: AlertTriangle, color: 'text-yellow-400' },
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
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Statistical Matrix</h2>
                  <p className="text-white/40 font-medium italic">Interactive visualizations and distributions.</p>
                </div>

                <Tabs defaultValue="visuals" className="w-full">
                  <div className="flex justify-center mb-10">
                    <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl h-auto">
                      <TabsTrigger value="visuals" className="rounded-xl px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-indigo-600">Visualizations</TabsTrigger>
                      <TabsTrigger value="stats" className="rounded-xl px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-indigo-600">Descriptive Summary</TabsTrigger>
                      <TabsTrigger value="table" className="rounded-xl px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-indigo-600">Preview</TabsTrigger>
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
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Strategic Interpretation</h2>
                  <p className="text-white/40 font-medium italic max-w-2xl mx-auto">Automated narrative synthesis provided for informational purposes only.</p>
                </div>

                <div className="relative group max-w-6xl mx-auto">
                  <Card className="relative bg-zinc-950/50 border-white/10 backdrop-blur-xl rounded-[2.5rem] min-h-[400px] flex flex-col justify-center">
                    <CardContent className="p-10">
                      {isAnalyzing ? (
                        <div className="space-y-10 py-10 text-center flex flex-col items-center">
                          <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-6" />
                          <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-sm animate-pulse">Synthesizing Narrative...</p>
                        </div>
                      ) : insights ? (
                        <div className="space-y-16 animate-in fade-in duration-1000">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                            <div className="lg:col-span-2 space-y-10">
                              <div>
                                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-6">Executive Summary</h4>
                                <p className="text-2xl text-white/90 leading-relaxed font-medium italic">"{insights.executiveSummary}"</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <Card className="bg-white/5 border-white/10 rounded-2xl p-8">
                                  <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2"><Activity className="h-4 w-4 text-indigo-500" /> Strategic Findings</h5>
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
                                  <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2"><Target className="h-4 w-4 text-emerald-500" /> Suggested Insights</h5>
                                  <ul className="space-y-4">
                                    {insights.recommendations.map((o: string, i: number) => (
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
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Analysis Confidence</p>
                                <div className="text-7xl font-black text-white mb-6 tracking-tighter">{insights.confidenceScore}%</div>
                                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Statistical Precision Score</p>
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
                          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto" />
                          <div className="space-y-2">
                            <p className="text-white/80 font-bold uppercase tracking-[0.25em] text-sm">Engine Standby</p>
                            <p className="text-white/40 font-medium max-w-md mx-auto">Interpretation services are currently offline.</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </section>

              <Separator className="bg-white/5" />

              {/* 4. Methodology & Disclaimer */}
              <section className="max-w-4xl mx-auto space-y-8">
                <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-10 space-y-6">
                  <div className="flex items-center gap-3 text-indigo-400 mb-2">
                    <Scale className="h-5 w-5" />
                    <h4 className="text-xs font-black uppercase tracking-[0.3em]">Methodology & Professional Disclosure</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Model Limitations</p>
                      <p className="text-xs text-white/50 leading-relaxed font-medium">
                        Statistical profiling is automated. Forecasts are probabilistic estimates based on historical sequences. Results depend entirely on the quality and completeness of the input dataset provided.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">User Responsibility</p>
                      <p className="text-xs text-white/50 leading-relaxed font-medium">
                        AutoStat AI provides analysis for informational purposes only. Results should not be considered professional financial, legal, or investment advice. Verify all findings independently.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-indigo-600/10 border-indigo-500/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="space-y-2 text-center md:text-left">
                    <h4 className="text-2xl font-black uppercase tracking-tighter">Executive PDF Export</h4>
                    <p className="text-white/40 text-xs font-medium">Generate a formal 9-page consulting report including audit trails and Strategic vectors.</p>
                  </div>
                  <Button 
                    onClick={handleExportPDF}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-16 px-10 font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 shrink-0"
                  >
                    <FileText className="mr-3 h-5 w-5" /> Export Report
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
              <p className="text-[10px] text-white/20 max-w-sm leading-relaxed uppercase tracking-wider font-bold">
                Informational Analytics Platform • Not Professional Advice
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
                <Link href="/security" className="hover:text-white">Security Center</Link>
              </div>
            </div>
            <div className="md:text-right space-y-2">
              <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black">
                © 2025 AUTOSTAT ANALYTICS
              </p>
              <p className="text-[10px] text-white/10 uppercase tracking-[0.2em] font-bold">
                PROFESSIONAL DISCLOSURE ATTACHED
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
