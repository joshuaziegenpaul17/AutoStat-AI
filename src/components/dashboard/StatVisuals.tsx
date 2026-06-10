
"use client"

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, LineChart, Line, Legend, AreaChart, Area,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Treemap
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { calculatePearsonCorrelation } from '@/lib/stats-engine';

interface StatVisualsProps {
  data: any[];
  numericColumns: string[];
  categoricalColumns: string[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6', '#14b8a6'];

export const StatVisuals: React.FC<StatVisualsProps> = ({ data, numericColumns, categoricalColumns }) => {
  const [selectedNum, setSelectedNum] = useState(numericColumns[0] || "");
  const [selectedCat, setSelectedCat] = useState(categoricalColumns[0] || "");
  const [scatterX, setScatterX] = useState(numericColumns[0] || "");
  const [scatterY, setScatterY] = useState(numericColumns[1] || numericColumns[0] || "");

  if (numericColumns.length === 0 && categoricalColumns.length === 0) {
    return null;
  }

  const getHistogramData = () => {
    if (!selectedNum) return [];
    const vals = data.map(d => Number(d[selectedNum])).filter(v => !isNaN(v));
    if (vals.length === 0) return [];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const binCount = 10;
    const binSize = (max - min) / binCount || 1;
    return Array.from({ length: binCount }).map((_, i) => {
      const start = min + i * binSize;
      const end = start + binSize;
      return {
        range: `${start.toFixed(1)}`,
        count: vals.filter(v => v >= start && (i === binCount - 1 ? v <= end : v < end)).length
      };
    });
  };

  const getCategoricalDistribution = () => {
    if (!selectedCat) return [];
    const counts: Record<string, number> = {};
    data.forEach(d => {
      const val = String(d[selectedCat]);
      if (val && val !== 'undefined') {
        counts[val] = (counts[val] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  const getCorrelationMatrix = () => {
    const cols = numericColumns.slice(0, 5);
    return cols.map(c1 => {
      const row: any = { name: c1 };
      cols.forEach(c2 => {
        const x = data.map(d => Number(d[c1])).filter(v => !isNaN(v));
        const y = data.map(d => Number(d[c2])).filter(v => !isNaN(v));
        row[c2] = calculatePearsonCorrelation(x, y);
      });
      return row;
    });
  };

  const getTrendData = () => {
    if (!selectedNum) return [];
    return data.slice(0, 50).map((d, i) => ({
      index: i,
      value: Number(d[selectedNum]) || 0
    }));
  };

  const ColumnSelector = ({ label, value, onValueChange, options }: any) => (
    <div className="flex flex-col gap-2">
      <Label className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="bg-white/5 border-white/10 rounded-xl text-xs h-10 font-bold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-white/10 text-white">
          {options.map((opt: string) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-8">
      <Tabs defaultValue={numericColumns.length > 0 ? "distribution" : "categorical"} className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl mb-6">
          {numericColumns.length > 0 && <TabsTrigger value="distribution">Distribution</TabsTrigger>}
          {numericColumns.length > 1 && <TabsTrigger value="correlation">Correlation</TabsTrigger>}
          {categoricalColumns.length > 0 && <TabsTrigger value="categorical">Categorical</TabsTrigger>}
          {numericColumns.length > 0 && <TabsTrigger value="trends">Trends</TabsTrigger>}
        </TabsList>

        {numericColumns.length > 0 && (
          <TabsContent value="distribution" className="grid grid-cols-1 lg:grid-cols-2 gap-8 outline-none">
            <Card className="bg-white/5 border-white/10 rounded-2xl shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-8">
                <div>
                  <CardTitle className="text-lg font-bold text-white">Feature Histogram</CardTitle>
                  <p className="text-xs text-white/40">Numerical frequency analysis</p>
                </div>
                <div className="w-48">
                  <ColumnSelector label="Vector" value={selectedNum} onValueChange={setSelectedNum} options={numericColumns} />
                </div>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getHistogramData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="range" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 rounded-2xl shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Density Overview</CardTitle>
                <p className="text-xs text-white/40">Area analysis of numerical spread</p>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getHistogramData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="range" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="count" stroke="#6366f1" fill="rgba(99, 102, 241, 0.2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {numericColumns.length > 1 && (
          <TabsContent value="correlation" className="grid grid-cols-1 lg:grid-cols-2 gap-8 outline-none">
            <Card className="bg-white/5 border-white/10 rounded-2xl shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Correlation Mapping</CardTitle>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <ColumnSelector label="Axis X" value={scatterX} onValueChange={setScatterX} options={numericColumns} />
                  <ColumnSelector label="Axis Y" value={scatterY} onValueChange={setScatterY} options={numericColumns} />
                </div>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" dataKey="x" name={scatterX} stroke="rgba(255,255,255,0.2)" fontSize={10} />
                    <YAxis type="number" dataKey="y" name={scatterY} stroke="rgba(255,255,255,0.2)" fontSize={10} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Data Points" data={data.slice(0, 200).map(d => ({ x: Number(d[scatterX]), y: Number(d[scatterY]) }))} fill="#6366f1" opacity={0.6} />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 rounded-2xl shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Heatmap Matrix</CardTitle>
                <p className="text-xs text-white/40">Pearson relationship strength (-1 to 1)</p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="min-w-[400px]">
                  <div className="grid" style={{ gridTemplateColumns: `repeat(${numericColumns.slice(0, 5).length + 1}, 1fr)` }}>
                    <div className="p-2" />
                    {numericColumns.slice(0, 5).map(col => (
                      <div key={col} className="p-2 text-[8px] font-bold text-white/40 uppercase tracking-widest text-center truncate">{col}</div>
                    ))}
                    {getCorrelationMatrix().slice(0, 5).map((row, i) => (
                      <React.Fragment key={i}>
                        <div className="p-2 text-[8px] font-bold text-white/40 uppercase tracking-widest truncate flex items-center">{row.name}</div>
                        {numericColumns.slice(0, 5).map(col => {
                          const val = row[col];
                          const opacity = Math.abs(val);
                          return (
                            <div 
                              key={col} 
                              className="p-2 text-xs font-mono text-center flex items-center justify-center border border-white/5 h-12"
                              style={{ backgroundColor: `rgba(99, 102, 241, ${opacity * 0.4})` }}
                            >
                              {val.toFixed(2)}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {categoricalColumns.length > 0 && (
          <TabsContent value="categorical" className="grid grid-cols-1 lg:grid-cols-2 gap-8 outline-none">
            <Card className="bg-white/5 border-white/10 rounded-2xl shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-8">
                <div>
                  <CardTitle className="text-lg font-bold text-white">Segment Share</CardTitle>
                  <p className="text-xs text-white/40">Categorical distribution analysis</p>
                </div>
                <div className="w-48">
                  <ColumnSelector label="Category" value={selectedCat} onValueChange={setSelectedCat} options={categoricalColumns} />
                </div>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getCategoricalDistribution()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getCategoricalDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 rounded-2xl shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Composition Radar</CardTitle>
                <p className="text-xs text-white/40">Multi-factor category comparison</p>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getCategoricalDistribution()}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                    <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" />
                    <Radar name="Count" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {numericColumns.length > 0 && (
          <TabsContent value="trends" className="grid grid-cols-1 lg:grid-cols-2 gap-8 outline-none">
            <Card className="bg-white/5 border-white/10 rounded-2xl shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Velocity Trend</CardTitle>
                <p className="text-xs text-white/40">Sequential data progression</p>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="index" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 rounded-2xl shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Hierarchical Treemap</CardTitle>
                <p className="text-xs text-white/40">Nested categorical volume</p>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={getCategoricalDistribution()}
                    dataKey="value"
                    aspectRatio={4 / 3}
                    stroke="#000"
                    fill="#6366f1"
                  >
                    <Tooltip />
                  </Treemap>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
