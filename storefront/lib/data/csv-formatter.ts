import { InventoryItem } from './sheets-fetcher';

interface CSVRow {
  [key: string]: string | number | undefined;
}

export function inventoryToCSV(
  items: InventoryItem[],
  includeImages: boolean = false
): string {
  const headers = [
    'SKU',
    'Brand',
    'Gender',
    'Garment',
    'Condition',
    'Price',
    'ListedPrice',
    'eBayURL',
    'PoshmarkURL',
    'Status',
    'DaysInInventory',
    'Notes',
    ...(includeImages ? ['ImageURL'] : []),
  ];

  const rows: CSVRow[] = items.map(item => ({
    SKU: item.sku,
    Brand: item.brand,
    Gender: item.gender,
    Garment: item.garment,
    Condition: item.condition,
    Price: item.price,
    ListedPrice: item.listedPrice,
    eBayURL: item.ebayUrl || '',
    PoshmarkURL: item.poshmarkUrl || '',
    Status: item.status,
    DaysInInventory: item.daysInInventory || 0,
    Notes: item.notes,
    ...(includeImages && { ImageURL: '' }), // Will be populated from image mapper
  }));

  // Build CSV with proper escaping
  const csvContent = [
    headers.map(h => escapeCSVField(h)).join(','),
    ...rows.map(row =>
      headers.map(header => escapeCSVField(row[header]?.toString() || '')).join(',')
    ),
  ].join('\n');

  return csvContent;
}

function escapeCSVField(field: string): string {
  if (!field) return '';

  // If field contains comma, newline, or double quote, wrap in quotes and escape internal quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`;
  }

  return field;
}

export function addImagesToCSV(
  csvContent: string,
  imageMap: Map<string, string[]>
): string {
  const lines = csvContent.split('\n');
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  if (!headers.includes('ImageURL')) {
    return csvContent;
  }

  const imageUrlIndex = headers.indexOf('ImageURL');
  const skuIndex = headers.indexOf('SKU');

  if (skuIndex === -1 || imageUrlIndex === -1) {
    return csvContent;
  }

  // Update each data row with images
  const updatedLines = [
    headerLine,
    ...lines.slice(1).map(line => {
      const row = parseCSVLine(line);
      if (row.length > skuIndex) {
        const sku = row[skuIndex];
        const images = imageMap.get(sku) || [];
        row[imageUrlIndex] = escapeCSVField(images.join(','));
      }
      return row.map(field => escapeCSVField(field)).join(',');
    }),
  ];

  return updatedLines.join('\n');
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}
