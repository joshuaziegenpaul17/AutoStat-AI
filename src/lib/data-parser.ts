import * as XLSX from 'xlsx';

export type ParsedData = {
  headers: string[];
  rows: Record<string, any>[];
  columnTypes: Record<string, 'number' | 'string'>;
};

/**
 * Parses a CSV string or an Excel file buffer into a structured dataset.
 * Includes data cleaning: trimming whitespace and handling missing values.
 */
export const parseDataset = async (file: File): Promise<ParsedData> => {
  const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');
  
  try {
    let rawRows: Record<string, any>[] = [];
    let headers: string[] = [];

    if (isExcel) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, any>[];
      if (rawRows.length > 0) {
        headers = Object.keys(rawRows[0]);
      }
    } else {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length > 0) {
        headers = splitCsvLine(lines[0]);
        for (let i = 1; i < lines.length; i++) {
          const values = splitCsvLine(lines[i]);
          const row: Record<string, any> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] ?? '';
          });
          rawRows.push(row);
        }
      }
    }

    if (rawRows.length === 0) return { headers: [], rows: [], columnTypes: {} };

    // DATA CLEANING PHASE
    const cleanedRows = rawRows.map(row => {
      const cleanedRow: Record<string, any> = {};
      headers.forEach(h => {
        let val = row[h];
        
        // 1. Trim whitespace for strings
        if (typeof val === 'string') {
          val = val.trim();
        }

        // 2. Handle missing values (normalize to empty string or null)
        if (val === undefined || val === null || val === 'NaN' || val === 'null' || val === 'undefined') {
          val = '';
        }

        // 3. Type Conversion Attempt
        const num = Number(val);
        if (val !== '' && !isNaN(num)) {
          cleanedRow[h] = num;
        } else {
          cleanedRow[h] = val;
        }
      });
      return cleanedRow;
    }).filter(row => {
      // Filter out completely empty rows
      return Object.values(row).some(v => v !== '');
    });

    return refineData(headers, cleanedRows);
  } catch (error) {
    console.error('Error in parseDataset:', error);
    throw new Error('Failed to parse dataset. Ensure it is a valid format and headers are present.');
  }
};

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