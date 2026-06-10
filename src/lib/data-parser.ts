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
      // header: 1 returns an array of arrays
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, any>[];
      
      if (jsonData.length === 0) return { headers: [], rows: [], columnTypes: {} };
      
      const headers = Object.keys(jsonData[0]);
      return refineData(headers, jsonData);
    } else {
      const text = await file.text();
      // Improved CSV splitting to handle quoted values with commas
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length === 0) return { headers: [], rows: [], columnTypes: {} };

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const rows: Record<string, any>[] = [];

      for (let i = 1; i < lines.length; i++) {
        // Basic CSV split - for production apps, use a dedicated library like PapaParse
        const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
        const row: Record<string, any> = {};
        headers.forEach((header, index) => {
          const val = values[index];
          if (val === undefined || val === '') {
             row[header] = '';
             return;
          }
          const num = Number(val);
          row[header] = (!isNaN(num) && val.trim() !== '') ? num : val;
        });
        rows.push(row);
      }
      return refineData(headers, rows);
    }
  } catch (error) {
    console.error('Error in parseDataset:', error);
    throw new Error('Failed to parse dataset format.');
  }
};

const refineData = (headers: string[], rows: Record<string, any>[]): ParsedData => {
  const columnTypes: Record<string, 'number' | 'string'> = {};

  headers.forEach(header => {
    const validRows = rows.filter(r => r[header] !== undefined && r[header] !== '');
    const numericCount = validRows.filter(r => typeof r[header] === 'number').length;
    columnTypes[header] = (validRows.length > 0 && numericCount > validRows.length / 2) ? 'number' : 'string';
  });

  return { headers, rows, columnTypes };
};

/**
 * Utility to convert parsed rows back to a CSV sample for AI analysis.
 */
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