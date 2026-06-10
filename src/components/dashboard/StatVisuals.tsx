"use client"

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, LineChart, Line, Legend, AreaChart, Area,
  PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { calculatePearsonCorrelation } from '@/lib/stats-engine';

interface StatVisualsProps {
  data: any[];
  numericColumns: string[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

export const StatVisuals: React.FC<StatVisualsProps> = ({ data, numericColumns }) => {
  const [histCol, setHistCol] = useState(numericColumns[0] || "");
  const [scatterX, setScatterX] = useState(numericColumns[0] || "");
  const [scatterY, setScatterY] = useState(numericColumns[1] || numericColumns[0] || "");

  if (numericColumns.length === 0) return (
    <div className="p-20 text-center border-dashed border-2 border-white/10 rounded-3xl">
      <p className="text-white/20 uppercase tracking-[0.4em] text-sm font-bold">No numerical data available for visualization.</p>
    </div>
  );

  const getHistogramData = () => {
    if (!histCol) return [];
    const vals = data.map(d => Number(d[histCol])).filter(v => !isNaN(v));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const binCount = 10;
    const binSize = (max - min) / binCount;
    return Array.from({ length: binCount }).map((_, i) => {
      const start = min + i * binSize;
      const end = start + binSize;
      return {
        range: `${start.toFixed(1)} - ${end.toFixed(1)}`,
        count: vals.filter(v => v >= start && v < end).length
      };
    });
  };

  const getCorrelationMatrix = () => {
    const cols = numericColumns.slice(0, 8);
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Histogram */}
      <Card className="bg-white/5 border-white/10 rounded-2xl shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-8">
          <div>
            <CardTitle className="text-lg font-bold text-white">Feature Distribution</CardTitle>
            <p className="text-xs text-white/40 mt-1">Binned numerical frequency analysis</p>
          </div>
          <div className="w-48">
            <ColumnSelector label="Vector" value={histCol} onValueChange={setHistCol} options={numericColumns} />
          </div>
        </CardHeader>
        <CardContent className="h-[400px]">
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

      {/* Scatter Plot */}
      <Card className="bg-white/5 border-white/10 rounded-2xl shadow-none">
        <CardHeader className="pb-8">
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
              <Scatter name="Data Points" data={data.slice(0, 100).map(d => ({ x: Number(d[scatterX]), y: Number(d[scatterY]) }))} fill="#6366f1" opacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Correlation Heatmap (Simplified as Grid) */}
      <Card className="bg-white/5 border-white/10 rounded-2xl shadow-none lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white">Pearson Correlation Matrix</CardTitle>
          <p className="text-xs text-white/40">Relationship strength between numerical features (-1.0 to 1.0)</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${numericColumns.slice(0, 8).length + 1}, 1fr)` }}>
              <div className="p-4" />
              {numericColumns.slice(0, 8).map(col => (
                <div key={col} className="p-4 text-[10px] font-bold text-white/40 uppercase tracking-widest text-center truncate">{col}</div>
              ))}
              {getCorrelationMatrix().map((row, i) => (
                <React.Fragment key={i}>
                  <div className="p-4 text-[10px] font-bold text-white/40 uppercase tracking-widest truncate flex items-center">{row.name}</div>
                  {numericColumns.slice(0, 8).map(col => {
                    const val = row[col];
                    const opacity = Math.abs(val);
                    return (
                      <div 
                        key={col} 
                        className="p-4 text-xs font-mono text-center flex items-center justify-center border border-white/5"
                        style={{ backgroundColor: `rgba(99, 102, 241, ${opacity * 0.3})` }}
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
    </div>
  );
};