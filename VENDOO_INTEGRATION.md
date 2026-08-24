# Vendoo Integration Guide

## Overview

The EHC Data API provides a hub-based inventory and image sync system for Vendoo. Vendoo pulls product data and images from the Data API and syncs them to eBay and Facebook Marketplace.

**Data Flow:**
```
[EHC Inventory Log (Google Sheets)]
            ↓
[Data API - Sheets & Drive Sync]
            ↓
[CSV/JSON Export with Images]
            ↓
[Vendoo Hub]
            ├→ eBay (direct sync)
            └→ Facebook Marketplace (catalog)
```

---

## Setup Instructions

### 1. Configure Environment Variables

Set these in your `.env.local` or production environment:

```bash
# Google Sheets Integration (required)
EHC_SHEET_ID=1-UcTy4Cr_NPK622SPRXob7LfpHFEw5874mv9y5E90Ys
GOOGLE_SHEETS_API_KEY=your_google_api_key_here

# Google Drive Image Sync (required for images)
GOOGLE_DRIVE_FOLDER_ID=your_ehc_import_folder_id_here
GOOGLE_DRIVE_API_KEY=your_google_drive_api_key_here
```

### 2. Obtain Folder and API Keys

**Google Sheets API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable "Google Sheets API"
4. Create an API key (Credentials → Create Credentials → API Key)
5. Copy the key to `GOOGLE_SHEETS_API_KEY`

**Google Drive Folder ID:**
1. Open [Google Drive](https://drive.google.com)
2. Navigate to "EHC Image Import Folder"
3. Right-click → Share
4. Copy the folder ID from the URL: `https://drive.google.com/drive/folders/{FOLDER_ID}`
5. Set sharing to "Anyone with the link → Viewer" (or use API key auth)

**Google Drive API Key:**
1. Same as above, enable "Google Drive API"
2. Create API key and copy to `GOOGLE_DRIVE_API_KEY`

### 3. Configure Vendoo

In your Vendoo account:

1. Add a new data source / integration
2. Type: **CSV Import** or **JSON Feed**
3. URL: `https://your-domain.com/api/data/export?format=csv&include-images=true`
   - For JSON: `?format=json&include-images=true`
4. Update frequency: Set to pull every 4-6 hours (or as needed)
5. Map the columns to Vendoo's fields:
   - `SKU` → Product ID
   - `Brand` → Brand
   - `Gender` → Category (or custom field)
   - `Garment` → Item Type
   - `Condition` → Condition
   - `Price` → Selling Price
   - `ImageURL` → Product Images (Vendoo will download from Drive URLs)

---

## API Endpoints

### CSV Export (Recommended for Vendoo)

**GET** `/api/data/export?format=csv&include-images=true`

Returns inventory as CSV with image URLs.

**Query Parameters:**
- `format=csv` — CSV format (default: json)
- `include-images=true` — Include image URLs (default: false)
- `filename=inventory.csv` — Custom filename for download

**Response Headers:**
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="inventory.csv"
```

**CSV Columns:**
```
SKU,Brand,Gender,Garment,Condition,Price,ListedPrice,eBayURL,PoshmarkURL,Status,DaysInInventory,Notes,ImageURL
SKU-001,Nike,Men,Jacket,9/10 — Like New,50,85,https://ebay.com/...,,In Stock,14,"Excellent condition, no defects","https://drive.google.com/uc?id=xxx"
SKU-002,Adidas,Women,Leggings,8/10 — Very Good,25,45,https://ebay.com/...,,In Stock,21,"Minor wear","https://drive.google.com/uc?id=yyy"
```

### JSON Export

**GET** `/api/data/export?format=json&include-images=true`

Returns inventory as JSON with image arrays.

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-07-31T12:00:00Z",
  "total": 71,
  "includeImages": true,
  "data": [
    {
      "sku": "SKU-001",
      "brand": "Nike",
      "gender": "Men",
      "garment": "Jacket",
      "condition": "9/10 — Like New",
      "conditionScore": 9,
      "price": 50,
      "listedPrice": 85,
      "ebayUrl": "https://ebay.com/...",
      "poshmarkUrl": null,
      "notes": "Excellent condition",
      "status": "In Stock",
      "daysInInventory": 14,
      "images": [
        "https://drive.google.com/uc?id=xxx",
        "https://drive.google.com/uc?id=yyy"
      ]
    }
  ]
}
```

### Manual Sync Triggers

**Sync Inventory from Sheets**

**POST** `/api/data/sync`

Manually trigger a sync from Google Sheets.

**Response:**
```json
{
  "success": true,
  "recordsProcessed": 71,
  "timestamp": "2026-07-31T12:00:00Z"
}
```

**Sync Images from Drive**

**POST** `/api/data/drive-sync`

Manually trigger image fetch and mapping from Google Drive.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalImages": 142,
    "totalInventoryItems": 71,
    "mappedItems": 65,
    "unmappedItems": 6
  },
  "duration": 2500,
  "timestamp": "2026-07-31T12:00:00Z"
}
```

---

## Sync Dashboard

Access the sync dashboard at: `/dashboard`

**Features:**
- View sync status (Idle / Syncing)
- Last sync timestamp for sheets and images
- Manual trigger buttons for inventory and image syncs
- Recent sync logs with status and error messages

---

## Column Mappings

### SKU (Product ID)
- **Source:** Google Sheets "SKU" column
- **Format:** `SKU-XXXXX` or custom format
- **Required:** Yes
- **Use in Vendoo:** Unique product identifier, used for linking across platforms

### Brand
- **Source:** Google Sheets "Brand" column
- **Format:** Text (e.g., "Nike", "Adidas")
- **Required:** Yes
- **Use in Vendoo:** Brand field for marketplace listings

### Gender (Category)
- **Source:** Google Sheets "Department" column (transformed to "Gender")
- **Format:** "Men" or "Women"
- **Required:** Yes
- **Use in Vendoo:** Category selector for filtering

### Garment (Item Type)
- **Source:** Google Sheets "Category" column (transformed to "Garment")
- **Format:** Text (e.g., "Jacket", "Denim", "Leggings")
- **Required:** Yes
- **Use in Vendoo:** Item type/subcategory

### Condition
- **Source:** Google Sheets "Condition" column
- **Format:** "X/10 — Description" (e.g., "9/10 — Like New")
- **Required:** Yes
- **Use in Vendoo:** Condition grade for marketplace

### Price
- **Source:** Google Sheets "Realistic Sold Value" (preferred) or "Price Listed"
- **Format:** Numeric (USD)
- **Required:** Yes
- **Use in Vendoo:** Selling price for eBay/Facebook

### ListedPrice
- **Source:** Google Sheets "Price Listed" column
- **Format:** Numeric (USD)
- **Optional:** For reference/comparison

### eBayURL
- **Source:** Google Sheets "eBay Link" column
- **Format:** Full URL
- **Optional:** Reference link to existing eBay listing

### PoshmarkURL
- **Source:** Google Sheets "Poshmark Link" column
- **Format:** Full URL
- **Optional:** Reference link to Poshmark listing

### Status
- **Source:** Google Sheets "Inventory Status" column
- **Format:** "In Stock", "Sold", "Pending", etc.
- **Use in Vendoo:** Item availability (Vendoo ignores "Sold" items)

### DaysInInventory
- **Source:** Calculated from Google Sheets "Timestamp" column
- **Format:** Integer (days)
- **Optional:** For analytics

### Notes
- **Source:** Google Sheets "Condition Notes" column
- **Format:** Text description
- **Optional:** For listing description

### ImageURL
- **Source:** Google Drive folder (EHC Image Import Folder)
- **Format:** Comma-separated Drive download URLs
- **Optional but recommended:** Vendoo will download and upload images to eBay/Facebook

---

## Image Sync Details

### How Images Are Mapped

1. **Filename Extraction:** SKU is extracted from image filenames using these patterns:
   - `SKU-12345-angle1.jpg` → SKU-12345
   - `SKU-12345_back.jpg` → SKU-12345
   - `12345-front.jpg` → 12345
   - `12345_angle.jpg` → 12345

2. **Image Organization:** Multiple images per SKU are supported and comma-separated in the CSV export.

3. **Drive URL Format:** Images are linked as public Google Drive URLs:
   ```
   https://drive.google.com/uc?id={FILE_ID}
   ```

### Folder Structure

Organize images in the "EHC Image Import Folder" by SKU:
```
EHC Image Import Folder/
├── SKU-001-angle1.jpg
├── SKU-001-back.jpg
├── SKU-001-side.jpg
├── SKU-002-front.jpg
├── SKU-002-detail.jpg
└── ...
```

Or create subfolders (Vendoo will recursively search):
```
EHC Image Import Folder/
├── SKU-001/
│   ├── angle1.jpg
│   ├── back.jpg
│   └── side.jpg
├── SKU-002/
│   ├── front.jpg
│   └── detail.jpg
└── ...
```

### Image Sync Statistics

Run image sync via dashboard or API, check the response for:
- **totalImages:** Total images found in folder
- **mappedItems:** Items with at least one image
- **unmappedItems:** Items with no images

---

## Troubleshooting

### "CSV export returns 501"
- Ensure CSV formatter is implemented
- Check logs for errors in `/api/data/export`

### "No images found"
- Verify `GOOGLE_DRIVE_FOLDER_ID` is set correctly
- Check folder sharing permissions (should be "Anyone with the link")
- Ensure image filenames contain SKU (e.g., `SKU-12345-angle.jpg`)
- Verify file type is supported (JPG, PNG, GIF, WebP)

### "Images don't upload to eBay/Facebook"
- Vendoo downloads from Google Drive URLs
- Ensure Drive folder is publicly accessible
- Check image file sizes (eBay/Facebook have size limits)
- Verify Vendoo is configured to use ImageURL column

### "Sync stalls or times out"
- May indicate large inventory or many images
- Increase API timeout if configurable
- Try syncing during off-peak hours
- Check Google Sheets/Drive API quotas

### "Some inventory items missing images"
- Not all SKUs have images - this is normal
- Use the dashboard to see mapping statistics
- Add images to the Drive folder and re-sync

---

## Performance & Optimization

### Sync Frequency
- **Recommended:** Every 4-6 hours
- **Max frequency:** Every 1-2 hours (respects Google API quotas)
- **Manual syncs:** Can be triggered anytime from dashboard

### Image Optimization
- Recommend JPG format for file size
- Typical product photo: 500-1000 KB
- Larger image sets (10+ per SKU) increase sync time

### API Rate Limits
- Google Sheets API: 100 requests/min per user
- Google Drive API: 1000 requests/min per project
- Vendoo will respect these limits

---

## Support & Monitoring

### Dashboard
Access `/dashboard` to monitor:
- Sync status and timestamps
- Error logs and details
- Manual trigger buttons

### Logs Location
- Sync logs: `public/logs/sync-state.json`
- Image mappings: `public/logs/image-mappings.json`

### Debugging
Enable verbose logs in your environment:
```bash
DEBUG=data-api:* npm run dev
```

---

## Next Steps

1. ✅ Deploy Data API with environment variables configured
2. ✅ Set up Google Sheets and Drive folder sharing
3. ✅ Add product images to EHC Image Import Folder
4. ✅ Configure Vendoo to pull from `/api/data/export?format=csv&include-images=true`
5. ✅ Set up Vendoo sync schedule (every 4-6 hours)
6. ✅ Monitor first sync through dashboard
7. ✅ Test marketplace sync (create test listings on eBay/Facebook)
8. ✅ Enable automatic syncs in production
