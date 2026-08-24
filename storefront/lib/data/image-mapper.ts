import { InventoryItem } from './sheets-fetcher';
import { DriveImage, groupImagesBySKU } from './drive-fetcher';
import fs from 'fs/promises';
import path from 'path';

const IMAGE_MAPPINGS_FILE = path.join(process.cwd(), 'public/logs/image-mappings.json');

export interface ImageMapping {
  sku: string;
  urls: string[];
  count: number;
  lastUpdated: string;
}

export interface ImageMappingsData {
  timestamp: string;
  totalImages: number;
  totalMappings: number;
  mappedItems: ImageMapping[];
}

export async function mapImagesToInventory(
  inventory: InventoryItem[],
  images: DriveImage[]
): Promise<{ map: Map<string, string[]>; stats: ImageMappingsData }> {
  const imageMap = groupImagesBySKU(images);

  const mappedItems: ImageMapping[] = [];
  let totalMappedItems = 0;

  inventory.forEach(item => {
    const urls = imageMap.get(item.sku) || [];
    if (urls.length > 0) {
      mappedItems.push({
        sku: item.sku,
        urls,
        count: urls.length,
        lastUpdated: new Date().toISOString(),
      });
      totalMappedItems++;
    }
  });

  // Sort by SKU for consistent output
  mappedItems.sort((a, b) => a.sku.localeCompare(b.sku));

  const stats: ImageMappingsData = {
    timestamp: new Date().toISOString(),
    totalImages: images.length,
    totalMappings: mappedItems.length,
    mappedItems,
  };

  // Save mappings to file
  await saveImageMappings(stats);

  return { map: imageMap, stats };
}

export async function saveImageMappings(data: ImageMappingsData): Promise<void> {
  try {
    const dir = path.dirname(IMAGE_MAPPINGS_FILE);

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    // Write mappings file
    await fs.writeFile(
      IMAGE_MAPPINGS_FILE,
      JSON.stringify(data, null, 2),
      'utf-8'
    );
  } catch (error) {
    console.error('Error saving image mappings:', error);
    throw error;
  }
}

export async function loadImageMappings(): Promise<Map<string, string[]>> {
  try {
    const data = await fs.readFile(IMAGE_MAPPINGS_FILE, 'utf-8');
    const parsed: ImageMappingsData = JSON.parse(data);

    const map = new Map<string, string[]>();
    parsed.mappedItems.forEach(item => {
      map.set(item.sku, item.urls);
    });

    return map;
  } catch (error) {
    // File doesn't exist yet or error reading - return empty map
    return new Map<string, string[]>();
  }
}

export async function getImageMappingStats(): Promise<{
  totalImages: number;
  totalMappings: number;
  lastUpdated: string | null;
} | null> {
  try {
    const data = await fs.readFile(IMAGE_MAPPINGS_FILE, 'utf-8');
    const parsed: ImageMappingsData = JSON.parse(data);

    return {
      totalImages: parsed.totalImages,
      totalMappings: parsed.totalMappings,
      lastUpdated: parsed.timestamp,
    };
  } catch {
    return null;
  }
}
