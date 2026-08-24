import axios from 'axios';
import { parseCSV } from './csv-parser';

const SHEET_ID = process.env.EHC_SHEET_ID || '1-UcTy4Cr_NPK622SPRXob7LfpHFEw5874mv9y5E90Ys';
const GID = '0'; // First sheet

export interface RawInventoryRow {
  'SKU': string;
  'Brand': string;
  'Department': string;
  'Category': string;
  'Condition': string;
  'Price Listed': string;
  'Realistic Sold Value': string;
  'eBay Link': string;
  'Poshmark Link': string;
  'Condition Notes': string;
  'Inventory Status': string;
  'Timestamp': string;
  'Drive Folder': string;
  [key: string]: string;
}

export interface InventoryItem {
  sku: string;
  brand: string;
  gender: string; // Department -> gender
  garment: string; // Category -> garment
  condition: string;
  conditionScore: number; // extracted from "X/10" format
  price: number;
  listedPrice: number;
  ebayUrl?: string;
  poshmarkUrl?: string;
  notes: string;
  status: string; // In Stock, Pending, Sold, etc.
  daysInInventory: number;
  driveFolder?: string;
}

async function fetchSheetCSV(): Promise<string> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

  try {
    const response = await axios.get(url, {
      timeout: 30000,
      headers: { 'User-Agent': 'EHC Data API' },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch EHC Inventory Log: ${error}`);
  }
}

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/[$,]/g, '')) || 0;
}

function extractConditionScore(condition: string): number {
  const match = condition.match(/(\d+)\/10/);
  return match ? parseInt(match[1], 10) : 0;
}

function getDaysInInventory(timestamp: string): number {
  if (!timestamp) return 0;
  const date = new Date(timestamp);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function isInStock(inventoryStatus: string, condition: string): boolean {
  const status = (inventoryStatus || '').toLowerCase();
  if (status === 'sold' || status === 'pending') return false;
  return !!condition;
}

export async function fetchAndParseInventory(): Promise<InventoryItem[]> {
  const csv = await fetchSheetCSV();
  const rows = parseCSV(csv) as RawInventoryRow[];

  return rows
    .filter(row => row.SKU?.trim()) // Skip empty rows
    .map(row => {
      const listedPrice = parsePrice(row['Price Listed']);
      const realPrice = parsePrice(row['Realistic Sold Value']);

      return {
        sku: row.SKU.trim(),
        brand: row.Brand || '',
        gender: row.Department || '', // Swapped per EHC convention
        garment: row.Category || '',
        condition: row.Condition || '',
        conditionScore: extractConditionScore(row.Condition || ''),
        price: realPrice || listedPrice,
        listedPrice,
        ebayUrl: row['eBay Link'] || undefined,
        poshmarkUrl: row['Poshmark Link'] || undefined,
        notes: row['Condition Notes'] || '',
        status: row['Inventory Status'] || 'Unknown',
        daysInInventory: getDaysInInventory(row.Timestamp),
        driveFolder: row['Drive Folder'] || undefined,
      };
    });
}

export async function getInventoryByStatus(status: string): Promise<InventoryItem[]> {
  const inventory = await fetchAndParseInventory();
  return inventory.filter(item =>
    item.status.toLowerCase().includes(status.toLowerCase())
  );
}

export async function getInventoryByGender(gender: string): Promise<InventoryItem[]> {
  const inventory = await fetchAndParseInventory();
  return inventory.filter(item =>
    item.gender.toLowerCase().includes(gender.toLowerCase())
  );
}
