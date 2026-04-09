/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of header objects { key: 'field', label: 'Display Name' }
 * @param {string} filename - Name of the exported file (without extension)
 */
export const exportToCSV = (data, headers, filename = 'export') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create CSV content
  const csvHeaders = headers.map(header => header.label).join(',');
  const csvRows = data.map(row =>
    headers.map(header => {
      const value = row[header.key];
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );

  const csvContent = [csvHeaders, ...csvRows].join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Get export data based on selection
 * @param {Array} allData - All available data
 * @param {Array} selectedIds - Array of selected row IDs
 * @param {string} idKey - Key to use as ID (default: 'id')
 * @returns {Array} Data to export
 */
export const getExportData = (allData, selectedIds, idKey = 'id') => {
  if (!selectedIds || selectedIds.length === 0) {
    return allData; // Export all if nothing selected
  }

  return allData.filter(item => selectedIds.includes(item[idKey]));
};