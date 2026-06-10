"use client"

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, LineChart, Line, Legend, AreaChart, Area,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, RadialBarChart, RadialBar
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StatVisualsProps {
  data: any[];
  numericColumns: string[];
}

const COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', 
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
];

export const StatVisuals: React.FC<StatVisualsProps> = ({ data, numericColumns }) => {
  if (numericColumns.length === 0) return (
    <div className="p-12 text-center glass rounded-3xl border-dashed border-white/10">
      <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">No numeric vectors detected for visualization.</p>
    </div>
  );

  const firstCol = numericColumns[0];
  const secondCol = numericColumns[1] || firstCol;
  const thirdCol = numericColumns[2] || secondCol;

  // 1. Histogram (Distribution)
  const min = Math.min(...data.map(d => d[firstCol]));
  const max = Math.max(...data.map(d => d[firstCol]));
  const binCount = 10;
  const binSize = (max - min) / binCount;
  const histogramData = Array.from({ length: binCount }).map((_, i) => {
    const start = min + i * binSize;
    const end = start + binSize;
    return {
      range: `${start.toFixed(1)}-${end.toFixed(1)}`,
      count: data.filter(d => d[firstCol] >= start && d[firstCol] < end).length
    };
  });

  // 2. Proportion Data (Pie Chart - Top 5 Categories of First String Column)
  const allHeaders = Object.keys(data[0] || {});
  const firstStringCol = allHeaders.find(h => typeof data[0][h] === 'string') || firstCol;
  const categoryCounts: Record<string, number> = {};
  data.forEach(d => {
    const val = String(d[firstStringCol]);
    categoryCounts[val] = (categoryCounts[val] || 0) + 1;
  });
  const pieData = Object.entries(categoryCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // 3. Radar Data (Averages of up to 5 numeric columns)
  const radarData = numericColumns.slice(0, 6).map(col => ({
    subject: col,
    A: data.reduce((acc, d) => acc + d[col], 0) / data.length,
    fullMark: Math.max(...data.map(d => d[col]))
  }));

  // 4. Radial Bar Data (Comparison of means relative to total mean)
  const radialData = numericColumns.slice(0, 5).map((col, idx) => ({
    name: col,
    value: data.reduce((acc, d) => acc + d[col], 0) / data.length,
    fill: COLORS[idx % COLORS.length]
  }));

  const chartCardClass = "glass-card border-none rounded-3xl shadow-xl overflow-hidden group hover:scale-[1.01] transition-all duration-300";

  return (
    <div className="space-y-8">
      <Tabs defaultValue="primary" className="w-full">
        <TabsList className="bg-slate-950/60 p-1 rounded-2xl mb-8 border border-white/5">
          <TabsTrigger value="primary" className="rounded-xl px-6 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">Core Vectors</TabsTrigger>
          <TabsTrigger value="proportions" className="rounded-xl px-6 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">Categorical & Proportions</TabsTrigger>
          <TabsTrigger value="comparative" className="rounded-xl px-6 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">Comparative Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="primary" className="grid grid-cols-1 lg:grid-cols-2 gap-8 outline-none">
          {/* 1. Histogram */}
          <Card className={chartCardClass}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full" /> Distribution: {firstCol}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="range" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 2. Scatter */}
          <Card className={chartCardClass}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-500 rounded-full" /> Correlation Matrix: {firstCol} vs {secondCol}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="x" name={firstCol} stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <YAxis dataKey="y" name={secondCol} stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Vectors" data={data.slice(0, 150).map(d => ({ x: d[firstCol], y: d[secondCol] }))} fill="#3b82f6" opacity={0.5} />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 3. Trend Area */}
          <Card className={`${chartCardClass} lg:col-span-2`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-purple-500 rounded-full" /> Sequential Trend: {firstCol}
              </CardTitle>
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
                  <Area type="monotone" dataKey={firstCol} stroke="#8b5cf6" fill="url(#areaGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proportions" className="grid grid-cols-1 lg:grid-cols-2 gap-8 outline-none">
          {/* 4. Pie Chart */}
          <Card className={chartCardClass}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-pink-500 rounded-full" /> Composition Analysis: {firstStringCol}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 5. Composed Chart */}
          <Card className={chartCardClass}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-orange-500 rounded-full" /> Dual Vector Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.slice(0, 30)}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" hide />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={firstCol} barSize={20} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey={secondCol} stroke="#ef4444" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 6. Vertical Horizontal Bar */}
          <Card className={`${chartCardClass} lg:col-span-2`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-cyan-500 rounded-full" /> Category Frequency Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={pieData} margin={{ left: 50 }}>
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
          {/* 7. Radar Chart */}
          <Card className={chartCardClass}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-yellow-500 rounded-full" /> Multivariate Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.5)" fontSize={10} />
                  <PolarRadiusAxis hide />
                  <Radar name="Averages" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 8. Radial Bar Chart */}
          <Card className={chartCardClass}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-lime-500 rounded-full" /> Benchmarked Means
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={15} data={radialData}>
                  <RadialBar label={{ position: 'insideStart', fill: '#fff', fontSize: 8 }} background dataKey="value" />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 9. Line Sequence */}
          <Card className={chartCardClass}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-indigo-500 rounded-full" /> Vector Synchrony: {firstCol} & {secondCol}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.slice(0, 50)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" hide />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={firstCol} stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey={secondCol} stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 10. Stacked Multi-Bar */}
          <Card className={chartCardClass}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-rose-500 rounded-full" /> Aggregated Stack: Multi-Vector
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" hide />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={firstCol} stackId="a" fill="#10b981" />
                  <Bar dataKey={secondCol} stackId="a" fill="#3b82f6" />
                  <Bar dataKey={thirdCol} stackId="a" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};