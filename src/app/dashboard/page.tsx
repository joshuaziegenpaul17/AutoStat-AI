
"use client"

import React, { useState } from 'react';
import { 
  BarChart3, Database, Brain, Download, RefreshCw, Info, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DatasetUpload } from '@/components/dashboard/DatasetUpload';
import { StatVisuals } from '@/components/dashboard/StatVisuals';
import { calculateDescriptiveStats, DescriptiveStats } from '@/lib/stats-engine';
import { narrativeAnalysisGenerator } from '@/ai/flows/narrative-analysis-generator';
import { ParsedData } from '@/lib/data-parser';

export default function Dashboard() {
  const [currentDataset, setCurrentDataset] = useState<ParsedData | null>(null);
  const [datasetName, setDatasetName] = useState<string>("");
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [descriptiveResults, setDescriptiveResults] = useState<Record<string, DescriptiveStats>>({});

  const handleUpload = (data: ParsedData, suggestions: any) => {
    setCurrentDataset(data);
    setAiSuggestions(suggestions);
    
    // Auto-calculate stats for all numeric columns
    const numericCols = Object.keys(data.columnTypes).filter(h => data.columnTypes[h] === 'number');
    const results: Record<string, DescriptiveStats> = {};
    numericCols.forEach(col => {
      const vals = data.rows.map(r => r[col]).filter(v => typeof v === 'number');
      if (vals.length > 0) {
        results[col] = calculateDescriptiveStats(vals);
      }
    });
    setDescriptiveResults(results);
    setNarrative(null); // Reset narrative for new data
  };

  const generateNarrative = async () => {
    if (!currentDataset) return;
    setIsGeneratingNarrative(true);
    try {
      const statsSummary = JSON.stringify(descriptiveResults);
      const result = await narrativeAnalysisGenerator({
        analysisResults: statsSummary,
        context: `Analyzing a dataset with ${currentDataset.rows.length} records across columns: ${currentDataset.headers.join(', ')}.`
      });
      setNarrative(result);
    } catch (err) {
      console.error("AI narrative failed", err);
    } finally {
      setIsGeneratingNarrative(false);
    }
  };

  const numericColumns = currentDataset ? Object.keys(currentDataset.columnTypes).filter(h => currentDataset.columnTypes[h] === 'number') : [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Dashboard Nav */}
      <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="font-headline font-bold text-lg">AutoStat<span className="text-primary">AI</span></span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <nav className="flex gap-4">
            <Button variant="ghost" size="sm" className="text-xs font-medium bg-white/5">Workbench</Button>
            <Button variant="ghost" size="sm" className="text-xs font-medium text-muted-foreground hover:text-white">Reports</Button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="glass border-primary/20 text-primary px-3 py-1 font-mono text-[10px]">VER: 1.0.4-BETA</Badge>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent glow-primary" />
        </div>
      </header>

      <main className="flex-grow container mx-auto p-8 max-w-[1400px]">
        {!currentDataset ? (
          <div className="py-20 animate-in fade-in zoom-in-95 duration-500">
            <DatasetUpload onUpload={handleUpload} />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-headline font-bold">Active Dataset Analysis</h2>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">VALIDATED</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Database className="h-3 w-3" /> {currentDataset.rows.length} Records</span>
                  <span className="flex items-center gap-1"><Plus className="h-3 w-3" /> {currentDataset.headers.length} Dimensions</span>
                  <span className="flex items-center gap-1 text-primary"><Brain className="h-3 w-3" /> AI Insights Active</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="glass border-white/10 text-xs" onClick={() => setCurrentDataset(null)}>
                  <RefreshCw className="h-3 w-3 mr-2" /> Reset
                </Button>
                <Button variant="outline" size="sm" className="glass border-white/10 text-xs">
                  <Download className="h-3 w-3 mr-2" /> PDF Report
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-xs font-bold rounded-full px-5">
                  Save Project
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Stats & Charts */}
              <div className="lg:col-span-8 space-y-8">
                <Tabs defaultValue="visuals" className="w-full">
                  <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl mb-6">
                    <TabsTrigger value="visuals" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Visual Intelligence</TabsTrigger>
                    <TabsTrigger value="table" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Raw Data View</TabsTrigger>
                    <TabsTrigger value="matrix" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Correlation</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="visuals">
                    <StatVisuals data={currentDataset.rows} numericColumns={numericColumns} />
                  </TabsContent>

                  <TabsContent value="table">
                    <Card className="glass-card border-none overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-white/5 text-muted-foreground uppercase tracking-wider font-bold">
                            <tr>
                              {currentDataset.headers.map(h => (
                                <th key={h} className="px-4 py-3 border-b border-white/5">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {currentDataset.rows.slice(0, 15).map((row, i) => (
                              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                {currentDataset.headers.map(h => (
                                  <td key={h} className="px-4 py-3">{row[h]}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="p-4 bg-white/5 text-center">
                        <p className="text-[10px] text-muted-foreground">Showing first 15 records of {currentDataset.rows.length}. Full dataset available in export.</p>
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="matrix">
                    <div className="p-8 text-center glass rounded-2xl border-white/5">
                      <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4 opacity-20" />
                      <h3 className="font-bold mb-2">Correlation Matrix Coming Soon</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">We are building an interactive heatmap for pearson correlation between all dimensions.</p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* AI Suggestions Card */}
                {aiSuggestions && (
                  <Card className="glass border-primary/20 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4">
                      <Info className="h-4 w-4 text-primary opacity-40" />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Data Quality Insights
                      </CardTitle>
                      <CardDescription className="text-xs">Automated scan for inconsistencies and improvements.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 italic">"{aiSuggestions.summary}"</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiSuggestions.suggestions.slice(0, 4).map((s: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/5">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold text-primary tracking-widest uppercase">{s.issueType}</span>
                              <Badge variant="outline" className="text-[9px] border-white/10 h-4">{s.affectedColumns[0]}</Badge>
                            </div>
                            <p className="text-[11px] leading-tight text-white/80">{s.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Stats Summary & AI Narrative */}
              <div className="lg:col-span-4 space-y-8">
                {/* Summary Panel */}
                <Card className="glass-card border-none">
                  <CardHeader>
                    <CardTitle className="text-lg">Descriptive Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {numericColumns.slice(0, 2).map(col => (
                      <div key={col} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-accent">{col}</h4>
                          <Badge variant="ghost" className="text-[10px] opacity-60">STABLE</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { l: 'Mean', v: descriptiveResults[col]?.mean.toFixed(2) },
                            { l: 'Median', v: descriptiveResults[col]?.median.toFixed(2) },
                            { l: 'Std Dev', v: descriptiveResults[col]?.stdDev.toFixed(2) },
                            { l: 'Max', v: descriptiveResults[col]?.max.toFixed(2) }
                          ].map(m => (
                            <div key={m.l} className="bg-white/5 p-2 rounded-lg">
                              <p className="text-[10px] text-muted-foreground uppercase">{m.l}</p>
                              <p className="text-sm font-mono font-bold">{m.v}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {numericColumns.length > 2 && (
                      <p className="text-[10px] text-center text-muted-foreground pt-2">
                        + {numericColumns.length - 2} more dimensions analyzed.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* AI Narrative Analysis */}
                <Card className="glass-card border-primary/30 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      Statistical Interpretation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!narrative ? (
                      <div className="py-8 text-center space-y-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Allow our generative engine to interpret the statistical trends and significance of your findings.
                        </p>
                        <Button 
                          onClick={generateNarrative} 
                          disabled={isGeneratingNarrative}
                          className="w-full bg-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl border border-primary/30 transition-all font-bold"
                        >
                          {isGeneratingNarrative ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Brain className="h-4 w-4 mr-2" />
                          )}
                          Generate AI Insights
                        </Button>
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 prose prose-invert prose-sm max-w-none">
                          <p className="text-sm leading-relaxed text-white/90 whitespace-pre-wrap">
                            {narrative}
                          </p>
                        </div>
                        <Button variant="ghost" className="w-full mt-4 text-[10px] text-muted-foreground uppercase tracking-widest font-bold h-8" onClick={() => setNarrative(null)}>
                          Regenerate Analysis
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
