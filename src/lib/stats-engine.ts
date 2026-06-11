export type DescriptiveStats = {
  mean: number;
  median: number;
  mode: number[];
  variance: number;
  stdDev: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  count: number;
  skewness: number;
  kurtosis: number;
  outliers: number[];
};

/**
 * Performs deep descriptive statistical analysis locally.
 */
export const calculateDescriptiveStats = (data: number[]): DescriptiveStats => {
  if (data.length === 0) return { mean: 0, median: 0, mode: [], variance: 0, stdDev: 0, min: 0, max: 0, q1: 0, q3: 0, count: 0, skewness: 0, kurtosis: 0, outliers: [] };

  const sorted = [...data].sort((a, b) => a - b);
  const count = data.length;
  const sum = data.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  const median = count % 2 === 0
    ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
    : sorted[Math.floor(count / 2)];

  const q1 = sorted[Math.floor(count * 0.25)];
  const q3 = sorted[Math.floor(count * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const outliers = data.filter(v => v < lowerBound || v > upperBound);

  const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (count - 1 || 1);
  const stdDev = Math.sqrt(variance);

  // Skewness (Sample)
  const skewness = (data.reduce((acc, val) => acc + Math.pow(val - mean, 3), 0) / count) / Math.pow(stdDev, 3) || 0;
  
  // Kurtosis (Sample Excess)
  const kurtosis = (data.reduce((acc, val) => acc + Math.pow(val - mean, 4), 0) / count) / Math.pow(stdDev, 4) - 3 || 0;

  const counts: Record<number, number> = {};
  data.forEach(x => {
    const val = Number(x);
    counts[val] = (counts[val] || 0) + 1;
  });
  const maxFreq = Math.max(...Object.values(counts));
  const mode = Object.keys(counts).filter(k => counts[Number(k)] === maxFreq).map(Number);

  return {
    mean, median, mode, variance, stdDev, min: sorted[0], max: sorted[count - 1], q1, q3, count, skewness, kurtosis, outliers
  };
};

/**
 * Calculates Pearson Correlation Coefficient locally.
 */
export const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  if (n === 0 || n !== y.length) return 0;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return denominator === 0 ? 0 : numerator / denominator;
};

/**
 * Projects future values using simple linear trend analysis.
 */
export const projectLocalTrend = (data: number[], horizon: number): number[] => {
  const n = data.length;
  if (n < 2) return Array(horizon).fill(data[0] || 0);
  
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return Array.from({ length: horizon }, (_, i) => {
    const nextX = n + i;
    return slope * nextX + intercept;
  });
};

/**
 * Audits data quality locally.
 */
export const calculateLocalDataQuality = (rows: any[], headers: string[]) => {
  let score = 100;
  const issues: string[] = [];
  
  const missingCount = rows.reduce((acc, row) => {
    return acc + headers.filter(h => row[h] === undefined || row[h] === null || row[h] === '').length;
  }, 0);
  
  const totalCells = rows.length * headers.length;
  const missingRatio = missingCount / totalCells;
  
  if (missingRatio > 0.05) {
    score -= Math.min(30, missingRatio * 100);
    issues.push(`${(missingRatio * 100).toFixed(1)}% of cells contain missing values.`);
  }
  
  if (rows.length < 10) {
    score -= 10;
    issues.push("Sample size is too small for statistical significance.");
  }
  
  return {
    qualityScore: Math.max(0, Math.round(score)),
    issuesIdentified: issues,
    missingValues: missingCount
  };
};
