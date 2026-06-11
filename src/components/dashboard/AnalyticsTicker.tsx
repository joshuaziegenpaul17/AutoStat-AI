
"use client"

import React from 'react';

interface AnalyticsTickerProps {
  dataPresent: boolean;
  qualityScore?: number;
  missingValues?: number;
}

export const AnalyticsTicker: React.FC<AnalyticsTickerProps> = ({ 
  dataPresent, 
  qualityScore = 0, 
  missingValues = 0 
}) => {
  const baseItems = [
    "ANALYTICS ENGINE: OPERATIONAL",
    "SECURE CLIENT-SIDE PROCESSING ACTIVE",
    "DATA PRIVACY PROTOCOLS: ENFORCED",
    "PROFESSIONAL STATISTICAL PROFILING READY",
  ];

  const dynamicItems = dataPresent ? [
    `DATASET LOADED SUCCESSFULLY`,
    `DATA QUALITY SCORE: ${qualityScore}%`,
    `MISSING VALUES DETECTED: ${missingValues}`,
    "CORRELATION ANALYSIS COMPLETED",
    "TEMPORAL FORECAST GENERATED",
    "AI EXECUTIVE INSIGHTS AVAILABLE",
  ] : [
    "WAITING FOR DATA INGESTION...",
    "READY FOR CSV/EXCEL UPLOAD",
    "IDLE: NO DATASET DETECTED",
  ];

  const allItems = [...baseItems, ...dynamicItems];

  return (
    <div className="w-full bg-indigo-600/10 border-y border-indigo-500/20 h-10 overflow-hidden flex items-center print:hidden">
      <div className="flex animate-marquee whitespace-nowrap gap-12 items-center">
        {[...allItems, ...allItems].map((item, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            <span className="text-[10px] font-black text-indigo-400 tracking-[0.3em] uppercase">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
