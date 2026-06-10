import * as XLSX from 'xlsx';

export type ParsedData = {
  headers: string[];
  rows: Record<string, any>[];
  columnTypes: Record<string, 'number' | 'string'>;
};

/**
 * Parses a CSV string or an Excel file buffer into a structured dataset.
 */
export const parseDataset = async (file: File): Promise<ParsedData> => {
  const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');
  
  try {
    if (isExcel) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, any>[];
      
      if (jsonData.length === 0) return { headers: [], rows: [], columnTypes: {} };
      
      const headers = Object.keys(jsonData[0]);
      return refineData(headers, jsonData);
    } else {
      const text = await file.text();
      // Handle various line endings
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length === 0) return { headers: [], rows: [], columnTypes: {} };

      // Better CSV header extraction handling quotes
      const headers = splitCsvLine(lines[0]);
      const rows: Record<string, any>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = splitCsvLine(lines[i]);
        const row: Record<string, any> = {};
        headers.forEach((header, index) => {
          const val = values[index];
          if (val === undefined || val === '') {
             row[header] = '';
             return;
          }
          const trimmedVal = val.trim();
          const num = Number(trimmedVal);
          row[header] = (!isNaN(num) && trimmedVal !== '') ? num : trimmedVal;
        });
        rows.push(row);
      }
      return refineData(headers, rows);
    }
  } catch (error) {
    console.error('Error in parseDataset:', error);
    throw new Error('Failed to parse dataset. Please check if the file is a valid Excel or CSV format.');
  }
};

/**
 * Robustly splits a CSV line, handling quoted values containing commas.
 */
function splitCsvLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

const refineData = (headers: string[], rows: Record<string, any>[]): ParsedData => {
  const columnTypes: Record<string, 'number' | 'string'> = {};

  headers.forEach(header => {
    const validRows = rows.filter(r => r[header] !== undefined && r[header] !== '');
    const numericCount = validRows.filter(r => typeof r[header] === 'number').length;
    // If more than 50% of non-empty values are numbers, treat column as numeric
    columnTypes[header] = (validRows.length > 0 && numericCount > validRows.length / 2) ? 'number' : 'string';
  });

  return { headers, rows, columnTypes };
};

export const getCsvSample = (data: ParsedData, limit = 100): string => {
  const sampleRows = data.rows.slice(0, limit);
  const headerLine = data.headers.join(',');
  const rowLines = sampleRows.map(row => 
    data.headers.map(h => {
      const val = row[h];
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
    }).join(',')
  );
  return [headerLine, ...rowLines].join('\n');
};