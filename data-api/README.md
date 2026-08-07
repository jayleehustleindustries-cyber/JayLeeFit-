# EHC Data API

Centralized data sync service for inventory, images, and eBay listings. Provides a single source of truth for product data across the Storefront and JayLeeFit applications.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Run development server
npm run dev
```

API runs on `http://localhost:3001`  
Dashboard: `http://localhost:3001/dashboard`

## Architecture

```
EHC Inventory Log (Google Sheets)
    ↓
    └→ Data API (this service)
        ├→ /api/inventory (GET) — Current product catalog
        ├→ /api/sync (POST/GET) — Trigger and monitor syncs
        ├→ /dashboard — Sync status dashboard
        │
        ├→ Storefront (reads products)
        └→ JayLeeFit (reads for testimonials/progress)
```

## Features

### ✅ Implemented
- **Google Sheets sync**: Fetch and parse EHC Inventory Log CSV export
- **Inventory API**: Query products by status, gender, or fetch all
- **Sync monitoring**: Track last sync time, records processed, errors
- **Dashboard**: Real-time UI to monitor and trigger syncs

### ⏳ In Progress
- **Google Drive sync**: Fetch images from EHC-IMPORT-INVENTORY folder
- **eBay sync**: Sync inventory status and pricing to eBay listings
- **Blob storage**: Upload images to Cloudinary (or similar)
- **Caching layer**: Reduce repeated fetches from Google Sheets

## API Endpoints

### GET /api/inventory
Fetch current inventory from EHC Inventory Log.

**Query parameters:**
- `status` (optional): Filter by inventory status (e.g., "In Stock", "Sold")
- `gender` (optional): Filter by gender/department (e.g., "Men", "Women")

**Example:**
```bash
curl http://localhost:3001/api/inventory
curl http://localhost:3001/api/inventory?status=In%20Stock
curl http://localhost:3001/api/inventory?gender=Women
```

**Response:**
```json
{
  "success": true,
  "total": 71,
  "data": [
    {
      "sku": "LEVI-001",
      "brand": "Levi's",
      "gender": "Men",
      "garment": "Jeans",
      "condition": "9/10",
      "conditionScore": 9,
      "price": 45.00,
      "listedPrice": 65.00,
      "status": "In Stock",
      "daysInInventory": 14,
      "notes": "No flaws",
      "ebayUrl": "...",
      "driveFolder": "..."
    }
  ]
}
```

### GET /api/sync
Get current sync state and logs.

**Response:**
```json
{
  "lastSync": {
    "sheets": "2026-07-31T15:30:00.000Z"
  },
  "activeSync": false,
  "logs": [
    {
      "timestamp": "2026-07-31T15:30:00.000Z",
      "source": "sheets",
      "status": "success",
      "recordsProcessed": 71,
      "recordsSkipped": 0,
      "errors": [],
      "duration": 1234
    }
  ]
}
```

### POST /api/sync
Trigger a manual sync from Google Sheets.

**Response:**
```json
{
  "success": true,
  "recordsProcessed": 71,
  "errors": [],
  "duration": 1234
}
```

## Environment Variables

See `.env.example` for the complete list. Key variables:

- `EHC_SHEET_ID` — Google Sheet ID (default: live EHC Inventory Log)
- `GOOGLE_DRIVE_FOLDER_ID` — Folder ID for EHC-IMPORT-INVENTORY
- `EBAY_CONSUMER_KEY`, `EBAY_TOKEN` — eBay API credentials
- `CLOUDINARY_*` — Blob storage (image hosting)

## Integration with Storefront

Update `storefront/lib/products.ts` to call this API instead of fetching Google Sheets directly:

```typescript
// Before:
const csv = await fetch(googleSheetURL);

// After:
const response = await fetch('http://localhost:3001/api/inventory');
const { data } = await response.json();
```

## Integration with JayLeeFit

Use inventory data in testimonials or client dashboard:

```typescript
// pages/api/client-dashboard.ts
const inventory = await fetch('http://localhost:3001/api/inventory?status=Sold');
const { data: recentSales } = await inventory.json();
```

## Deployment

### Vercel

```bash
# Push to your branch
git push origin <branch>

# Create a new Vercel project
vercel --prod

# Set environment variables in Vercel dashboard
# Deploy
```

**Note:** Data API should run on a separate port/domain from Storefront and JayLeeFit. Environment variables in those apps should point to the deployed Data API URL.

### Local Testing

Run all three services locally:

```bash
# Terminal 1: Data API (port 3001)
cd data-api && npm run dev

# Terminal 2: Storefront (port 3000)
cd storefront && npm run dev

# Terminal 3: JayLeeFit (port 3002)
cd jayleefit-website && npm run dev -- -p 3002
```

Then update `.env.local` in Storefront and JayLeeFit to point to `http://localhost:3001/api`.

## Troubleshooting

### "Failed to fetch EHC Inventory Log"
- Check that the Google Sheet ID in `.env.local` is correct
- Verify the sheet is publicly accessible (or API key is valid)
- Google Sheets must have at least one data row

### Sync never completes
- Check sync logs in `/dashboard`
- Look for error messages in server console
- Verify network connectivity to Google Sheets

### API returns empty inventory
- Ensure EHC Inventory Log has data (71+ rows)
- Check that column headers match expected names (SKU, Brand, Department, Category, etc.)
- Run manual sync via dashboard

## Support

For questions on data mapping or API design, see:
- `storefront/lib/verify-ehc-mapping.ts` — Column mapping verification
- `CLAUDE.md` — Project overview and open threads

Contact: jayleehustle.industries@gmail.com
