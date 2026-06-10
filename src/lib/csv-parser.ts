
export type ParsedData = {
  headers: string[];
  rows: Record<string, any>[];
  columnTypes: Record<string, 'number' | 'string'>;
};

export const parseCSV = (csv: string): ParsedData => {
  const lines = csv.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [], columnTypes: {} };

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Record<string, any>[] = [];
  const columnTypes: Record<string, 'number' | 'string'> = {};

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: Record<string, any> = {};
    headers.forEach((header, index) => {
      const val = values[index];
      const num = Number(val);
      if (!isNaN(num) && val !== '') {
        row[header] = num;
        if (!columnTypes[header]) columnTypes[header] = 'number';
      } else {
        row[header] = val;
        columnTypes[header] = 'string';
      }
    });
    rows.push(row);
  }

  // Refine column types based on majority
  headers.forEach(header => {
    const numericCount = rows.filter(r => typeof r[header] === 'number').length;
    columnTypes[header] = numericCount > rows.length / 2 ? 'number' : 'string';
  });

  return { headers, rows, columnTypes };
};
