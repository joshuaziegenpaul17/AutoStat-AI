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
  data.forEach(x => counts[x] = (counts[x] || 0) + 1);
  const maxFreq = Math.max(...Object.values(counts));
  const mode = Object.keys(counts).filter(k => counts[Number(k)] === maxFreq).map(Number);

  return {
    mean, median, mode, variance, stdDev, min: sorted[0], max: sorted[count - 1], q1, q3, count, skewness, kurtosis, outliers
  };
};

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

export const calculateLinearRegression = (x: number[], y: number[]) => {
  const n = x.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const r = calculatePearsonCorrelation(x, y);
  return { slope, intercept, r2: r * r };
};

export const detectAnomalies = (data: number[]) => {
  const stats = calculateDescriptiveStats(data);
  return stats.outliers;
};
