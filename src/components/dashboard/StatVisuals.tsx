"use client"

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, LineChart, Line, Legend, AreaChart, Area,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, RadialBarChart, RadialBar
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface StatVisualsProps {
  data: any[];
  numericColumns: string[];
}

const COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', 
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
];

export const StatVisuals: React.FC<StatVisualsProps> = ({ data, numericColumns }) => {
  const allHeaders = data.length > 0 ? Object.keys(data[0]) : [];
  const stringColumns = allHeaders.filter(h => !numericColumns.includes(h));

  // State for column selections
  const [histCol, setHistCol] = useState(numericColumns[0] || "");
  const [scatterX, setScatterX] = useState(numericColumns[0] || "");
  const [scatterY, setScatterY] = useState(numericColumns[1] || numericColumns[0] || "");
  const [areaCol, setAreaCol] = useState(numericColumns[0] || "");
  const [pieCatCol, setPieCatCol] = useState(stringColumns[0] || allHeaders[0] || "");
  const [composedBarCol, setComposedBarCol] = useState(numericColumns[0] || "");
  const [composedLineCol, setComposedLineCol] = useState(numericColumns[1] || numericColumns[0] || "");
  const [freqCol, setFreqCol] = useState(stringColumns[0] || allHeaders[0] || "");
  const [radarCols, setRadarCols] = useState(numericColumns.slice(0, 5));
  const [radialCols, setRadialCols] = useState(numericColumns.slice(0, 5));
  const [lineCol1, setLineCol1] = useState(numericColumns[0] || "");
  const [lineCol2, setLineCol2] = useState(numericColumns[1] || numericColumns[0] || "");
  const [stackCol1, setStackCol1] = useState(numericColumns[0] || "");
  const [stackCol2, setStackCol2] = useState(numericColumns[1] || numericColumns[0] || "");
  const [stackCol3, setStackCol3] = useState(numericColumns[2] || numericColumns[0] || "");

  if (allHeaders.length === 0) return (
    <div className="p-12 text-center glass rounded-3xl border-dashed border-white/10">
      <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">No data available for visualization.</p>
    </div>
  );

  // Chart Data Calculations
  const getHistogramData = () => {
    if (!histCol) return [];
    const vals = data.map(d => d[histCol]).filter(v => typeof v === 'number');
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const binCount = 10;
    const binSize = (max - min) / binCount;
    return Array.from({ length: binCount }).map((_, i) => {
      const start = min + i * binSize;
      const end = start + binSize;
      return {
        range: `${start.toFixed(1)}-${end.toFixed(1)}`,
        count: vals.filter(v => v >= start && v < end).length
      };
    });
  };

  const getPieData = () => {
    if (!pieCatCol) return [];
    const counts: Record<string, number> = {};
    data.forEach(d => {
      const val = String(d[pieCatCol]);
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  const getRadarData = () => {
    return radarCols.map(col => ({
      subject: col,
      A: data.reduce((acc, d) => acc + (Number(d[col]) || 0), 0) / data.length,
      fullMark: Math.max(...data.map(d => Number(d[col]) || 0))
    }));
  };

  const getRadialData = () => {
    return radialCols.map((col, idx) => ({
      name: col,
      value: data.reduce((acc, d) => acc + (Number(d[col]) || 0), 0) / data.length,
      fill: COLORS[idx % COLORS.length]
    }));
  };

  const ColumnSelector = ({ label, value, onValueChange, options, className = "" }: any) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-8 text-[11px] bg-slate-950/40 border-white/10 rounded-lg">
          <SelectValue placeholder="Select Column" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-white/10">
          {options.map((opt: string) => (
            <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const chartCardClass = "glass-card border-none rounded-3xl shadow-xl overflow-hidden flex flex-col";

  return (
    <div className="space-y-8">
      <Tabs defaultValue="primary" className="w-full">
        <TabsList className="bg-slate-950/60 p-1 rounded-2xl mb-8 border border-white/5">
          <TabsTrigger value="primary" className="rounded-xl px-6 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">Core Vectors</TabsTrigger>
          <TabsTrigger value="proportions" className="rounded-xl px-6 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">Categorical & Proportions</TabsTrigger>
          <TabsTrigger value="comparative" className="rounded-xl px-6 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">Comparative Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="primary" className="grid grid-cols-1 lg:grid-cols-2 gap-8 outline-none">
          <Card className={chartCardClass}>
            <CardHeader className="pb-4 space-y-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full" /> Distribution Histogram
              </CardTitle>
              <ColumnSelector label="Value Column" value={histCol} onValueChange={setHistCol} options={numericColumns} />
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getHistogramData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="range" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={chartCardClass}>
            <CardHeader className="pb-4 space-y-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-500 rounded-full" /> Correlation Scatter
              </CardTitle>
              <div className="grid grid-cols-2 gap-4">
                <ColumnSelector label="X Axis" value={scatterX} onValueChange={setScatterX} options={numericColumns} />
                <ColumnSelector label="Y Axis" value={scatterY} onValueChange={setScatterY} options={numericColumns} />
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" dataKey="x" name={scatterX} stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <YAxis type="number" dataKey="y" name={scatterY} stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Vectors" data={data.slice(0, 150).map(d => ({ x: Number(d[scatterX]), y: Number(d[scatterY]) }))} fill="#3b82f6" opacity={0.5} />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={`${chartCardClass} lg:col-span-2`}>
            <CardHeader className="pb-4 space-y-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-purple-500 rounded-full" /> Sequential Trend
              </CardTitle>
              <ColumnSelector label="Metric to Track" value={areaCol} onValueChange={setAreaCol} options={numericColumns} className="max-w-xs" />
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.slice(0, 100).map((d, i) => ({ ...d, idx: i }))}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="idx" hide />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip />
                  <Area type="monotone" dataKey={areaCol} stroke="#8b5cf6" fill="url(#areaGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proportions" className="grid grid-cols-1 lg:grid-cols-2 gap-8 outline-none">
          <Card className={chartCardClass}>
            <CardHeader className="pb-4 space-y-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-pink-500 rounded-full" /> Composition Analysis
              </CardTitle>
              <ColumnSelector label="Category Field" value={pieCatCol} onValueChange={setPieCatCol} options={allHeaders} />
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={getPieData()} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {getPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={chartCardClass}>
            <CardHeader className="pb-4 space-y-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-orange-500 rounded-full" /> Dual Vector Comparison
              </CardTitle>
              <div className="grid grid-cols-2 gap-4">
                <ColumnSelector label="Bar Metric" value={composedBarCol} onValueChange={setComposedBarCol} options={numericColumns} />
                <ColumnSelector label="Line Metric" value={composedLineCol} onValueChange={setComposedLineCol} options={numericColumns} />
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.slice(0, 30)}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" hide />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={composedBarCol} barSize={20} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey={composedLineCol} stroke="#ef4444" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={`${chartCardClass} lg:col-span-2`}>
            <CardHeader className="pb-4 space-y-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-cyan-500 rounded-full" /> Category Frequency
              </CardTitle>
              <ColumnSelector label="Target Category" value={freqCol} onValueChange={setFreqCol} options={allHeaders} className="max-w-xs" />
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={getPieData()} margin={{ left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#06b6d4" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparative" className="grid grid-cols-1 lg:grid-cols-2 gap-8 outline-none">
          <Card className={chartCardClass}>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-yellow-500 rounded-full" /> Multivariate Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData()}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.5)" fontSize={10} />
                  <PolarRadiusAxis hide />
                  <Radar name="Averages" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={chartCardClass}>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-lime-500 rounded-full" /> Benchmarked Means
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={15} data={getRadialData()}>
                  <RadialBar background dataKey="value" />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={chartCardClass}>
            <CardHeader className="pb-4 space-y-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-indigo-500 rounded-full" /> Vector Synchrony
              </CardTitle>
              <div className="grid grid-cols-2 gap-4">
                <ColumnSelector label="Vector 1" value={lineCol1} onValueChange={setLineCol1} options={numericColumns} />
                <ColumnSelector label="Vector 2" value={lineCol2} onValueChange={setLineCol2} options={numericColumns} />
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.slice(0, 50)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis hide />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={lineCol1} stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey={lineCol2} stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={chartCardClass}>
            <CardHeader className="pb-4 space-y-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-rose-500 rounded-full" /> Aggregated Stack
              </CardTitle>
              <div className="grid grid-cols-3 gap-2">
                <ColumnSelector label="Base" value={stackCol1} onValueChange={setStackCol1} options={numericColumns} />
                <ColumnSelector label="Mid" value={stackCol2} onValueChange={setStackCol2} options={numericColumns} />
                <ColumnSelector label="Top" value={stackCol3} onValueChange={setStackCol3} options={numericColumns} />
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis hide />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={stackCol1} stackId="a" fill="#10b981" />
                  <Bar dataKey={stackCol2} stackId="a" fill="#3b82f6" />
                  <Bar dataKey={stackCol3} stackId="a" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
