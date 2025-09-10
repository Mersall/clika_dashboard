import { format } from 'date-fns';

export type ExportFormat = 'csv' | 'json';

interface ExportOptions {
  filename?: string;
  format?: ExportFormat;
}

export function useExport() {
  const exportToCSV = (data: any[], headers: string[], filename: string) => {
    // Create CSV content
    const csvHeaders = headers.join(',');
    const csvRows = data.map(item => {
      return headers.map(header => {
        const keys = header.split('.');
        let value = item;
        for (const key of keys) {
          value = value?.[key];
        }
        // Handle special cases
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`;
        }
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });
    
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data: any[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportData = (
    data: any[],
    headers: string[],
    options: ExportOptions = {}
  ) => {
    const {
      filename = `export-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}`,
      format: exportFormat = 'csv'
    } = options;

    if (exportFormat === 'csv') {
      exportToCSV(data, headers, filename);
    } else {
      exportToJSON(data, filename);
    }
  };

  return { exportData };
}