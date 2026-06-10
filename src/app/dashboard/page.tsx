"use client"

import React, { useState, useMemo } from 'react';
import { BarChart3, Database, FileText, Download, LayoutDashboard, ChevronLeft, Table, PieChart, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DatasetUpload } from '@/components/dashboard/DatasetUpload';
import { StatVisuals } from '@/components/dashboard/StatVisuals';
import { calculateDescriptiveStats, DescriptiveStats } from '@/lib/stats-engine';
import { ParsedData } from '@/lib/data-parser';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function Dashboard() {
  const [currentDataset, setCurrentDataset] = useState<ParsedData | null>(null);
  const { toast } = useToast();

  const handleUpload = (data: ParsedData) => {
    setCurrentDataset(data);
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

  const handleExport = () => {
    if (!currentDataset) return;
    const timestamp = new Date().toISOString();
    const content = `
AUTOSTAT AI - STATISTICAL REPORT
Generated: ${timestamp}
---------------------------------
DATASET SUMMARY:
Total Rows: ${currentDataset.rows.length}
Total Columns: ${currentDataset.headers.length}
Numeric Vectors: ${numericColumns.length}

STATISTICAL OVERVIEW:
${Object.entries(descriptiveResults).map(([col, stats]) => `
[${col}]
Mean: ${stats.mean.toFixed(4)}
Median: ${stats.median.toFixed(4)}
Std Dev: ${stats.stdDev.toFixed(4)}
Range: ${stats.min} - ${stats.max}
`).join('\n')}

END OF REPORT
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `autostat-report-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <header className="h-16 border-b border-white/5 glass sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <BarChart3 className="text-white h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">AutoStat AI</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <nav className="flex items-center gap-4 text-xs font-bold text-white/40 uppercase tracking-widest">
            <LayoutDashboard className="h-3 w-3" /> Workspace
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-indigo-500/20 text-indigo-400 bg-indigo-500/5 text-[10px] font-bold px-3 py-1">
            ENGINE STATUS: ONLINE
          </Badge>
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-600/30" />
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto">
        {!currentDataset ? (
          <div className="py-20 animate-in fade-in zoom-in-95 duration-700">
            <DatasetUpload onUpload={handleUpload} />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 border border-white/10 p-6 rounded-2xl">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setCurrentDataset(null)} className="text-white/40 hover:text-white hover:bg-white/5">
                  <ChevronLeft className="h-4 w-4 mr-2" /> New Dataset
                </Button>
                <div className="h-6 w-px bg-white/10" />
                <div>
                  <h1 className="text-xl font-bold text-white">Analysis: {currentDataset.rows.length.toLocaleString()} Records</h1>
                  <p className="text-xs text-white/40 font-medium">{numericColumns.length} Numerical Vectors Mapped</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleExport} className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-widest">
                  <Download className="h-4 w-4 mr-2" /> Export Report
                </Button>
              </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Rows', value: currentDataset.rows.length.toLocaleString(), icon: Database },
                { label: 'Total Columns', value: currentDataset.headers.length, icon: Table },
                { label: 'Numerical Features', value: numericColumns.length, icon: Activity },
                { label: 'Missing Values', value: '0.0%', icon: PieChart },
              ].map((stat, i) => (
                <Card key={i} className="bg-white/5 border-white/10 shadow-none rounded-2xl">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <stat.icon className="h-8 w-8 text-indigo-500 opacity-50" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="visuals" className="w-full">
              <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl mb-8">
                <TabsTrigger value="visuals" className="rounded-lg px-8 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Visual Analysis</TabsTrigger>
                <TabsTrigger value="stats" className="rounded-lg px-8 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Descriptive Statistics</TabsTrigger>
                <TabsTrigger value="table" className="rounded-lg px-8 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Data Table</TabsTrigger>
              </TabsList>

              <TabsContent value="visuals" className="mt-0 outline-none">
                <StatVisuals data={currentDataset.rows} numericColumns={numericColumns} />
              </TabsContent>

              <TabsContent value="stats" className="mt-0 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {numericColumns.map(col => (
                    <Card key={col} className="bg-white/5 border-white/10 shadow-none rounded-2xl overflow-hidden">
                      <CardHeader className="border-b border-white/5 bg-white/[0.02] p-6">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-indigo-400">{col}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-2 gap-y-4">
                          {[
                            { label: 'Mean', value: descriptiveResults[col]?.mean.toFixed(2) },
                            { label: 'Median', value: descriptiveResults[col]?.median.toFixed(2) },
                            { label: 'Std Dev', value: descriptiveResults[col]?.stdDev.toFixed(2) },
                            { label: 'Variance', value: descriptiveResults[col]?.variance.toFixed(2) },
                            { label: 'Min', value: descriptiveResults[col]?.min },
                            { label: 'Max', value: descriptiveResults[col]?.max },
                          ].map((item, idx) => (
                            <div key={idx}>
                              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">{item.label}</p>
                              <p className="text-lg font-mono text-white">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="table" className="mt-0 outline-none">
                <Card className="bg-white/5 border-white/10 shadow-none rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/[0.02] sticky top-0 text-white/40 font-bold uppercase tracking-widest text-[10px] border-b border-white/10">
                        <tr>
                          {currentDataset.headers.map(h => <th key={h} className="px-6 py-4">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/60">
                        {currentDataset.rows.slice(0, 50).map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                            {currentDataset.headers.map(h => (
                              <td key={h} className="px-6 py-4 whitespace-nowrap font-mono">{row[h]}</td>
                            ))}
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