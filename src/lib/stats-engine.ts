
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
};

export type CorrelationMatrix = {
  headers: string[];
  matrix: number[][];
};

export const calculateDescriptiveStats = (data: number[]): DescriptiveStats => {
  const sorted = [...data].sort((a, b) => a - b);
  const count = data.length;
  const sum = data.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  const median = count % 2 === 0
    ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
    : sorted[Math.floor(count / 2)];

  const q1 = sorted[Math.floor(count * 0.25)];
  const q3 = sorted[Math.floor(count * 0.75)];

  const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (count - 1);
  const stdDev = Math.sqrt(variance);

  // Simple mode calculation
  const counts: Record<number, number> = {};
  data.forEach(x => counts[x] = (counts[x] || 0) + 1);
  const maxFreq = Math.max(...Object.values(counts));
  const mode = Object.keys(counts).filter(k => counts[Number(k)] === maxFreq).map(Number);

  return {
    mean,
    median,
    mode,
    variance,
    stdDev,
    min: sorted[0],
    max: sorted[count - 1],
    q1,
    q3,
    count
  };
};

export const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};

export const performSimpleLinearRegression = (x: number[], y: number[]) => {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};
