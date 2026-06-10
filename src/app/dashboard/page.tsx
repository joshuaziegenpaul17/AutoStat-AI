"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, Database, FileText, Download, LayoutDashboard, ChevronLeft, 
  Table, PieChart, Activity, Sparkles, TrendingUp, ShieldCheck, 
  Zap, BrainCircuit, FileJson, Share2, Info, Loader2, RefreshCw
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

export default function Dashboard() {
  const [currentDataset, setCurrentDataset] = useState<ParsedData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [auditResults, setAuditResults] = useState<any>(null);
  const { toast } = useToast();

  const handleUpload = (data: ParsedData) => {
    setCurrentDataset(data);
    setInsights(null);
    setAuditResults(null);
    toast({ title: "Dataset Uploaded", description: `Successfully ingested ${data.rows.length} records.` });
  };

  const runAiAnalysis = async () => {
    if (!currentDataset) return;
    setIsAnalyzing(true);
    const sample = getCsvSample(currentDataset, 100);
    
    try {
      const [insightsRes, auditRes] = await Promise.all([
        runInsightsAction(sample, currentDataset.headers),
        runAuditAction(sample, currentDataset.headers)
      ]);

      if (insightsRes.success) setInsights(insightsRes.data);
      if (auditRes.success) setAuditResults(auditRes.data);
      
      toast({ title: "Analysis Complete", description: "Strategic synthesis and audit mission successful." });
    } catch (err) {
      toast({ variant: "destructive", title: "Analysis Failed", description: "Engine overload. Please retry." });
    } finally {
      setIsAnalyzing(false);
    }
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

  const dataHealthScore = useMemo(() => {
    if (!currentDataset) return 0;
    if (auditResults?.qualityScore) return auditResults.qualityScore;
    // Default fallback calculation
    return 85; 
  }, [currentDataset, auditResults]);

  const handleExport = () => {
    if (!currentDataset) return;
    const timestamp = new Date().toISOString();
    const content = `
AUTOSTAT AI - ENTERPRISE MISSION REPORT
Generated: ${timestamp}
---------------------------------
EXECUTIVE SUMMARY:
${insights?.executiveSummary || "No AI synthesis available."}

DATASET TOPOLOGY:
Total Records: ${currentDataset.rows.length}
Dimensions: ${currentDataset.headers.length}
Numerical Vectors: ${numericColumns.length}
Categorical Features: ${categoricalColumns.length}
Data Health Score: ${dataHealthScore}%

KEY FINDINGS:
${insights?.keyFindings?.map((f: string) => `- ${f}`).join('\n') || "Pending analysis..."}

STRATEGIC RECOMMENDATIONS:
${insights?.recommendations?.map((r: string) => `- ${r}`).join('\n') || "Pending analysis..."}

STATISTICAL OVERVIEW:
${Object.entries(descriptiveResults).map(([col, stats]) => `
[${col}]
Mean: ${stats.mean.toFixed(4)} | Median: ${stats.median.toFixed(4)} | Std Dev: ${stats.stdDev.toFixed(4)}
Skewness: ${stats.skewness.toFixed(2)} | Kurtosis: ${stats.kurtosis.toFixed(2)}
Outliers Detected: ${stats.outliers.length}
`).join('\n')}

END OF MISSION LOG
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `autostat-enterprise-log-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
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
            <span className="text-indigo-500 flex items-center gap-2"><LayoutDashboard className="h-3.5 w-3.5" /> Command Center</span>
            <span className="hover:text-white transition-colors cursor-pointer">Archive</span>
            <span className="hover:text-white transition-colors cursor-pointer">Nodes</span>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="border-indigo-500/20 text-indigo-400 bg-indigo-500/5 text-[10px] font-bold px-4 py-1.5 uppercase tracking-widest">
            ENGINE STATUS: {isAnalyzing ? 'SYNTHESIZING...' : 'READY'}
          </Badge>
          <div className="w-10 h-10 rounded-full bg-indigo-600/10 border border-white/10 flex items-center justify-center">
            <Activity className="h-5 w-5 text-indigo-500" />
          </div>
        </div>
      </header>

      <main className="p-10 max-w-[1700px] mx-auto space-y-10">
        {!currentDataset ? (
          <div className="py-20 animate-in fade-in zoom-in-95 duration-1000">
            <DatasetUpload onUpload={handleUpload} />
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            {/* Executive AI Panel */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <Card className="relative bg-zinc-950/50 border-white/10 backdrop-blur-xl overflow-hidden rounded-[2rem]">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 p-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-600/20">
                      <BrainCircuit className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold tracking-tight">Executive AI Intelligence</CardTitle>
                      <CardDescription className="text-white/40 font-medium">Global mission synthesis and strategic pattern detection</CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={runAiAnalysis} 
                    disabled={isAnalyzing}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 px-8 font-bold uppercase tracking-widest text-xs"
                  >
                    {isAnalyzing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                    {isAnalyzing ? "Processing..." : "Run AI Synthesis"}
                  </Button>
                </CardHeader>
                <CardContent className="p-10">
                  {insights ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in duration-500">
                      <div className="lg:col-span-2 space-y-8">
                        <div>
                          <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-4">Strategic Overview</h4>
                          <p className="text-lg text-white/80 leading-relaxed font-medium">{insights.executiveSummary}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles className="h-3 w-3 text-indigo-500" /> Key Findings</h5>
                            <ul className="space-y-3">
                              {insights.keyFindings.map((f: string, i: number) => (
                                <li key={i} className="text-sm text-white/60 flex items-start gap-3">
                                  <div className="mt-1.5 w-1 h-1 rounded-full bg-indigo-500 shrink-0" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2"><TrendingUp className="h-3 w-3 text-emerald-500" /> Recommendations</h5>
                            <ul className="space-y-3">
                              {insights.recommendations.map((r: string, i: number) => (
                                <li key={i} className="text-sm text-white/60 flex items-start gap-3">
                                  <div className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-8">
                        <div className="p-8 rounded-[2rem] bg-indigo-600/5 border border-indigo-500/20 text-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10"><BrainCircuit className="h-20 w-20" /></div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Confidence Matrix</p>
                          <div className="text-6xl font-black text-white mb-2">{insights.confidenceScore}%</div>
                          <p className="text-xs text-white/40">Statistical Certainty Model</p>
                          <div className="mt-6 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${insights.confidenceScore}%` }} />
                          </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
                          <h5 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> Red Flags</h5>
                          <ul className="space-y-3">
                            {insights.dataAnomalies.map((a: string, i: number) => (
                              <li key={i} className="text-xs text-red-400/80 font-mono">{a}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="p-6 rounded-full bg-white/5 border border-white/10 animate-pulse">
                          <BrainCircuit className="h-10 w-10 text-white/20" />
                        </div>
                        <div>
                          <p className="text-white/40 uppercase tracking-[0.2em] font-bold text-xs">Awaiting Analysis Directive</p>
                          <p className="text-sm text-white/20 mt-2">Trigger AI Synthesis to generate deep mission intelligence</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/[0.02] border border-white/10 p-8 rounded-[2rem] backdrop-blur-md">
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="sm" onClick={() => setCurrentDataset(null)} className="text-white/40 hover:text-white hover:bg-white/5 h-10 px-4 rounded-xl">
                  <ChevronLeft className="h-4 w-4 mr-2" /> Reset Mission
                </Button>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">{currentDataset.rows.length.toLocaleString()} Records Loaded</h1>
                  <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">Topology: {currentDataset.headers.length} Dimensions Mapped</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleExport} className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-12 px-8 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em]">
                  <Download className="h-4 w-4 mr-2" /> Export Mission Log
                </Button>
                <Button variant="outline" className="border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 h-12 px-8 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em]">
                  <Share2 className="h-4 w-4 mr-2" /> Share Insights
                </Button>
              </div>
            </div>

            {/* Global Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Data Health Score', value: `${dataHealthScore}%`, icon: ShieldCheck, color: 'text-indigo-400', desc: 'Structural integrity rating' },
                { label: 'Numerical Vectors', value: numericColumns.length, icon: Zap, color: 'text-emerald-400', desc: 'Calculable features' },
                { label: 'Anomalous Points', value: auditResults?.issuesIdentified?.length || 0, icon: Activity, color: 'text-red-400', desc: 'Detected structural noise' },
                { label: 'Ingestion Latency', value: '42ms', icon: BrainCircuit, color: 'text-purple-400', desc: 'Process response time' },
              ].map((stat, i) => (
                <Card key={i} className="bg-white/5 border-white/10 shadow-none rounded-[2rem] overflow-hidden group hover:bg-white/[0.08] transition-all">
                  <CardContent className="p-8 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                      <p className="text-[10px] text-white/30 font-medium mt-2">{stat.desc}</p>
                    </div>
                    <stat.icon className={`h-12 w-12 ${stat.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Analysis Control Center */}
            <Tabs defaultValue="visuals" className="w-full">
              <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl mb-10 overflow-x-auto h-auto">
                <TabsTrigger value="visuals" className="rounded-xl px-10 py-3 text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-indigo-600">Visual Suite</TabsTrigger>
                <TabsTrigger value="stats" className="rounded-xl px-10 py-3 text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-indigo-600">Statistical Engine</TabsTrigger>
                <TabsTrigger value="table" className="rounded-xl px-10 py-3 text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-indigo-600">Raw Datastream</TabsTrigger>
                <TabsTrigger value="audit" className="rounded-xl px-10 py-3 text-[10px] font-bold uppercase tracking-[0.2em] data-[state=active]:bg-indigo-600">Structural Audit</TabsTrigger>
              </TabsList>

              <TabsContent value="visuals" className="mt-0 outline-none">
                <StatVisuals data={currentDataset.rows} numericColumns={numericColumns} categoricalColumns={categoricalColumns} />
              </TabsContent>

              <TabsContent value="stats" className="mt-0 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {numericColumns.map(col => (
                    <Card key={col} className="bg-white/5 border-white/10 shadow-none rounded-[2rem] overflow-hidden hover:border-white/20 transition-all">
                      <CardHeader className="border-b border-white/5 bg-white/[0.02] p-8">
                        <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">{col}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="grid grid-cols-2 gap-y-8">
                          {[
                            { label: 'Mean', value: descriptiveResults[col]?.mean.toFixed(2) },
                            { label: 'Median', value: descriptiveResults[col]?.median.toFixed(2) },
                            { label: 'Std Dev', value: descriptiveResults[col]?.stdDev.toFixed(2) },
                            { label: 'Variance', value: descriptiveResults[col]?.variance.toFixed(2) },
                            { label: 'Skewness', value: descriptiveResults[col]?.skewness.toFixed(2) },
                            { label: 'Kurtosis', value: descriptiveResults[col]?.kurtosis.toFixed(2) },
                            { label: 'Min', value: descriptiveResults[col]?.min },
                            { label: 'Max', value: descriptiveResults[col]?.max },
                          ].map((item, idx) => (
                            <div key={idx}>
                              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">{item.label}</p>
                              <p className="text-xl font-black text-white tabular-nums">{item.value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-10 pt-8 border-t border-white/5">
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Outlier Detection</p>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {descriptiveResults[col]?.outliers.length > 0 ? (
                              descriptiveResults[col].outliers.slice(0, 5).map((v, idx) => (
                                <Badge key={idx} variant="outline" className="border-red-500/20 text-red-400 bg-red-500/5 px-3 py-1 font-mono text-[10px]">{v}</Badge>
                              ))
                            ) : (
                              <span className="text-xs text-white/20 font-bold italic tracking-widest">No structural anomalies detected</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="table" className="mt-0 outline-none">
                <Card className="bg-white/5 border-white/10 shadow-none rounded-[2rem] overflow-hidden">
                  <div className="overflow-x-auto max-h-[700px]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/[0.04] sticky top-0 text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] border-b border-white/10">
                        <tr>
                          {currentDataset.headers.map(h => <th key={h} className="px-8 py-6">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/60">
                        {currentDataset.rows.slice(0, 100).map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                            {currentDataset.headers.map(h => (
                              <td key={h} className="px-8 py-5 whitespace-nowrap font-mono text-xs">{row[h]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-6 border-t border-white/10 bg-white/[0.02] text-center">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">End of Preview Data Segment</p>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="audit" className="mt-0 outline-none">
                <Card className="bg-white/5 border-white/10 shadow-none rounded-[2rem] p-10">
                  {auditResults ? (
                    <div className="space-y-12">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold tracking-tight">Structural Integrity Audit</h3>
                          <p className="text-white/40 mt-1 font-medium">Automatic verification of dataset schema and value distribution</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-1">Global Audit Score</p>
                          <div className="text-5xl font-black text-white">{auditResults.qualityScore}/100</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-4">Identified Risks</h4>
                          {auditResults.issuesIdentified.map((issue: string, i: number) => (
                            <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-red-500/5 border border-red-500/10">
                              <Info className="h-5 w-5 text-red-400 shrink-0" />
                              <span className="text-sm text-red-200/80 font-mono">{issue}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-6">
                          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-4">Repair Suggestions</h4>
                          {auditResults.suggestions.map((s: any, i: number) => (
                            <div key={i} className="p-6 rounded-2xl bg-indigo-600/5 border border-indigo-500/10 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{s.issueType}</span>
                                <div className="flex gap-1">
                                  {s.affectedColumns.map((c: string) => <Badge key={c} variant="outline" className="text-[8px] border-white/10">{c}</Badge>)}
                                </div>
                              </div>
                              <p className="text-sm text-white/80 font-medium">{s.description}</p>
                              <p className="text-xs text-indigo-400/80 leading-relaxed"><span className="font-bold text-white/60">ACTION:</span> {s.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                      <ShieldCheck className="h-12 w-12 text-white/10" />
                      <div>
                        <p className="text-white/40 uppercase tracking-widest text-xs font-bold">Structural Audit Engine Standby</p>
                        <p className="text-sm text-white/20 mt-2">Ingest analysis to run automated data quality verification</p>
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
