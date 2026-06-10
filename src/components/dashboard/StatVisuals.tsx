"use client"

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, LineChart, Line, Legend, AreaChart, Area,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, RadialBarChart, RadialBar, ZAxis
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

  // State for chart column selections
  const [histCol, setHistCol] = useState(numericColumns[0] || "");
  const [scatterX, setScatterX] = useState(numericColumns[0] || "");
  const [scatterY, setScatterY] = useState(numericColumns[1] || numericColumns[0] || "");
  
  const [areaCol, setAreaCol] = useState(numericColumns[0] || "");
  const [pieCatCol, setPieCatCol] = useState(stringColumns[0] || allHeaders[0] || "");
  
  const [composedBarCol, setComposedBarCol] = useState(numericColumns[0] || "");
  const [composedLineCol, setComposedLineCol] = useState(numericColumns[1] || numericColumns[0] || "");
  
  const [lineCol1, setLineCol1] = useState(numericColumns[0] || "");
  const [lineCol2, setLineCol2] = useState(numericColumns[1] || numericColumns[0] || "");
  
  // Advanced State
  const [bubbleX, setBubbleX] = useState(numericColumns[0] || "");
  const [bubbleY, setBubbleY] = useState(numericColumns[1] || numericColumns[0] || "");
  const [bubbleZ, setBubbleZ] = useState(numericColumns[2] || numericColumns[0] || "");
  
  const [stepCol, setStepCol] = useState(numericColumns[0] || "");
  
  const [radialCol, setRadialCol] = useState(stringColumns[0] || allHeaders[0] || "");

  if (allHeaders.length === 0) return (
    <div className="p-20 text-center glass rounded-[3.5rem] border-dashed border-white/10">
      <p className="text-white/20 uppercase tracking-[0.4em] text-sm font-black">No Mission Data Available</p>
    </div>
  );

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
        range: `${start.toFixed(1)}`,
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
    const radarCols = numericColumns.slice(0, 5);
    return radarCols.map(col => ({
      subject: col,
      A: data.reduce((acc, d) => acc + (Number(d[col]) || 0), 0) / data.length,
      fullMark: Math.max(...data.map(d => Number(d[col]) || 0))
    }));
  };

  const getRadialData = () => {
    if (!radialCol) return [];
    const counts: Record<string, number> = {};
    data.forEach(d => {
      const val = String(d[radialCol]);
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value], i) => ({ 
        name, 
        value, 
        fill: COLORS[i % COLORS.length] 
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  };

  const ColumnSelector = ({ label, value, onValueChange, options, className = "" }: any) => (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Label className="text-[9px] uppercase font-black text-white/30 tracking-[0.3em]">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-10 text-[11px] bg-slate-950/60 border-white/10 rounded-xl font-bold">
          <SelectValue placeholder="Target Vector" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-white/10">
          {options.map((opt: string) => (
            <SelectItem key={opt} value={opt} className="text-xs font-medium">{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const chartCardClass = "glass border-none rounded-[3rem] shadow-2xl overflow-hidden flex flex-col p-8 md:p-10";

  return (
    <div className="space-y-12">
      <Tabs defaultValue="primary" className="w-full">
        <TabsList className="bg-slate-950/80 p-1.5 rounded-[2.5rem] mb-12 border border-white/10 w-full overflow-x-auto scrollbar-hide flex">
          <TabsTrigger value="primary" className="rounded-[2rem] px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-black transition-all flex-1">Core Vectors</TabsTrigger>
          <TabsTrigger value="proportions" className="rounded-[2rem] px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-black transition-all flex-1">Distribution</TabsTrigger>
          <TabsTrigger value="comparative" className="rounded-[2rem] px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-black transition-all flex-1">Benchmarks</TabsTrigger>
          <TabsTrigger value="advanced" className="rounded-[2rem] px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-black transition-all flex-1">Advanced Synthesis</TabsTrigger>
        </TabsList>

        <TabsContent value="primary" className="grid grid-cols-1 lg:grid-cols-2 gap-10 outline-none">
          <Card className={chartCardClass}>
            <CardHeader className="pb-8 p-0 space-y-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-4">
                <div className="w-2 h-6 bg-emerald-500 rounded-full glow-primary" /> Distribution Histogram
              </CardTitle>
              <ColumnSelector label="Analysis Vector" value={histCol} onValueChange={setHistCol} options={numericColumns} />
            </CardHeader>
            <CardContent className="h-[350px] p-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getHistogramData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="range" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={chartCardClass}>
            <CardHeader className="pb-8 p-0 space-y-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-4">
                <div className="w-2 h-6 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)]" /> Correlation Scatter
              </CardTitle>
              <div className="grid grid-cols-2 gap-6">
                <ColumnSelector label="Vector X" value={scatterX} onValueChange={setScatterX} options={numericColumns} />
                <ColumnSelector label="Vector Y" value={scatterY} onValueChange={setScatterY} options={numericColumns} />
              </div>
            </CardHeader>
            <CardContent className="h-[350px] p-0">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis type="number" dataKey="x" name={scatterX} stroke="rgba(255,255,255,0.2)" fontSize={10} />
                  <YAxis type="number" dataKey="y" name={scatterY} stroke="rgba(255,255,255,0.2)" fontSize={10} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Vectors" data={data.slice(0, 200).map(d => ({ x: Number(d[scatterX]), y: Number(d[scatterY]) }))} fill="#3b82f6" opacity={0.6} shape="circle" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={`${chartCardClass} lg:col-span-2`}>
            <CardHeader className="pb-8 p-0 space-y-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-4">
                <div className="w-2 h-6 bg-purple-500 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.4)]" /> Sequential Multi-Trend
              </CardTitle>
              <ColumnSelector label="Primary Trajectory" value={areaCol} onValueChange={setAreaCol} options={numericColumns} className="max-w-xs" />
            </CardHeader>
            <CardContent className="h-[400px] p-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.slice(0, 100).map((d, i) => ({ ...d, idx: i }))}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="idx" hide />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '16px' }} />
                  <Area type="monotone" dataKey={areaCol} stroke="#8b5cf6" fill="url(#areaGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proportions" className="grid grid-cols-1 lg:grid-cols-2 gap-10 outline-none">
          <Card className={chartCardClass}>
            <CardHeader className="pb-8 p-0 space-y-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-4">
                <div className="w-2 h-6 bg-pink-500 rounded-full" /> Composition Analysis
              </CardTitle>
              <ColumnSelector label="Category Domain" value={pieCatCol} onValueChange={setPieCatCol} options={allHeaders} />
            </CardHeader>
            <CardContent className="h-[350px] p-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={getPieData()} innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value">
                    {getPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={chartCardClass}>
            <CardHeader className="pb-8 p-0 space-y-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-4">
                <div className="w-2 h-6 bg-orange-500 rounded-full" /> Dual Vector Synthesis
              </CardTitle>
              <div className="grid grid-cols-2 gap-6">
                <ColumnSelector label="Bar Vector" value={composedBarCol} onValueChange={setComposedBarCol} options={numericColumns} />
                <ColumnSelector label="Line Vector" value={composedLineCol} onValueChange={setComposedLineCol} options={numericColumns} />
              </div>
            </CardHeader>
            <CardContent className="h-[350px] p-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.slice(0, 30)}>
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                  <Bar dataKey={composedBarCol} barSize={30} fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  <Line type="monotone" dataKey={composedLineCol} stroke="#ef4444" strokeWidth={4} dot={{ r: 4, fill: '#ef4444' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparative" className="grid grid-cols-1 lg:grid-cols-2 gap-10 outline-none">
          <Card className={chartCardClass}>
            <CardHeader className="pb-8 p-0">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-4">
                <div className="w-2 h-6 bg-yellow-500 rounded-full" /> Multivariate Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] p-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData()}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.4)" fontSize={10} fontWeight="black" />
                  <Radar name="Cluster Averages" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} strokeWidth={3} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={chartCardClass}>
            <CardHeader className="pb-8 p-0 space-y-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-4">
                <div className="w-2 h-6 bg-indigo-500 rounded-full" /> Vector Synchrony
              </CardTitle>
              <div className="grid grid-cols-2 gap-6">
                <ColumnSelector label="Vector A" value={lineCol1} onValueChange={setLineCol1} options={numericColumns} />
                <ColumnSelector label="Vector B" value={lineCol2} onValueChange={setLineCol2} options={numericColumns} />
              </div>
            </CardHeader>
            <CardContent className="h-[350px] p-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.slice(0, 60)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis hide />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase' }} />
                  <Line type="monotone" dataKey={lineCol1} stroke="#6366f1" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey={lineCol2} stroke="#10b981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="grid grid-cols-1 lg:grid-cols-2 gap-10 outline-none">
          <Card className={chartCardClass}>
            <CardHeader className="pb-8 p-0 space-y-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-4">
                <div className="w-2 h-6 bg-cyan-500 rounded-full" /> Bubble Multi-Vector Correlation
              </CardTitle>
              <div className="grid grid-cols-3 gap-4">
                <ColumnSelector label="X Vector" value={bubbleX} onValueChange={setBubbleX} options={numericColumns} />
                <ColumnSelector label="Y Vector" value={bubbleY} onValueChange={setBubbleY} options={numericColumns} />
                <ColumnSelector label="Size (Z)" value={bubbleZ} onValueChange={setBubbleZ} options={numericColumns} />
              </div>
            </CardHeader>
            <CardContent className="h-[350px] p-0">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis type="number" dataKey="x" name={bubbleX} stroke="rgba(255,255,255,0.2)" fontSize={10} />
                  <YAxis type="number" dataKey="y" name={bubbleY} stroke="rgba(255,255,255,0.2)" fontSize={10} />
                  <ZAxis type="number" dataKey="z" range={[50, 400]} name={bubbleZ} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter 
                    name="Advanced Mapping" 
                    data={data.slice(0, 100).map(d => ({ 
                      x: Number(d[bubbleX]), 
                      y: Number(d[bubbleY]), 
                      z: Number(d[bubbleZ]) 
                    }))} 
                    fill="#06b6d4" 
                    fillOpacity={0.5} 
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={chartCardClass}>
            <CardHeader className="pb-8 p-0 space-y-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-4">
                <div className="w-2 h-6 bg-lime-500 rounded-full" /> Radial Category Magnitude
              </CardTitle>
              <ColumnSelector label="Radial Domain" value={radialCol} onValueChange={setRadialCol} options={allHeaders} />
            </CardHeader>
            <CardContent className="h-[350px] p-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={20} data={getRadialData()}>
                  <RadialBar
                    label={{ position: 'insideStart', fill: '#fff', fontSize: 8 }}
                    background
                    dataKey="value"
                  />
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0, fontSize: 10, fontWeight: 'bold' }} />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={`${chartCardClass} lg:col-span-2`}>
            <CardHeader className="pb-8 p-0 space-y-6">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-4">
                <div className="w-2 h-6 bg-red-500 rounded-full" /> Step Line Sequence Analysis
              </CardTitle>
              <ColumnSelector label="Sequence Vector" value={stepCol} onValueChange={setStepCol} options={numericColumns} className="max-w-xs" />
            </CardHeader>
            <CardContent className="h-[400px] p-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.slice(0, 80).map((d, i) => ({ ...d, idx: i }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="idx" hide />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '16px' }} />
                  <Line type="stepAfter" dataKey={stepCol} stroke="#ef4444" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};