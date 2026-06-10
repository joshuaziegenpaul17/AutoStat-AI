
"use client"

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface StatVisualsProps {
  data: any[];
  numericColumns: string[];
}

export const StatVisuals: React.FC<StatVisualsProps> = ({ data, numericColumns }) => {
  if (numericColumns.length === 0) return null;

  const firstCol = numericColumns[0];
  const secondCol = numericColumns[1] || firstCol;

  // Histogram data preparation (simple binning)
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <span className="w-2 h-6 bg-primary rounded-full" />
            Distribution: {firstCol}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="range" stroke="rgba(255,255,255,0.4)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#85b0ff' }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <span className="w-2 h-6 bg-accent rounded-full" />
            Scatter: {firstCol} vs {secondCol}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="x" name={firstCol} stroke="rgba(255,255,255,0.4)" fontSize={10} />
              <YAxis dataKey="y" name={secondCol} stroke="rgba(255,255,255,0.4)" fontSize={10} />
              <ZAxis type="number" range={[60, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter 
                name="Data points" 
                data={data.slice(0, 100).map(d => ({ x: d[firstCol], y: d[secondCol] }))} 
                fill="hsl(var(--accent))"
                opacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card border-none lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <span className="w-2 h-6 bg-purple-500 rounded-full" />
            Trend Analysis (First 50 Observations)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.slice(0, 50).map((d, i) => ({ ...d, index: i }))}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="index" stroke="rgba(255,255,255,0.4)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey={firstCol} 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
