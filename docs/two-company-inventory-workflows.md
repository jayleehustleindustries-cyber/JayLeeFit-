# Two-Company Inventory Workflows

All inventory intake is now routed into one of two independent company workflows. The company must be selected before any image upload, database record, catalog update, generated visual, social caption, or publishing request is prepared.

| Company | Asset location | Records location | Catalog file | Instagram destination |
|---|---|---|---|---|
| **Magicdeals Wholesale Outlet** | [Dedicated Magicdeals Drive folder](https://drive.google.com/drive/folders/1i0iepaWtxeM-AtND6O0o282b-KZcUtDC) | Airtable base `appRxuE8F529tN7oY`, table `tblXhvLIzTxgyLCIb` | `site/magicdeals-inventory-catalog-data.json` | `@magicdeals_wholesale_outlet` |
| **JayLeeFit** | [Dedicated JayLeeFit Drive folder](https://drive.google.com/drive/folders/1e8BchK8r-N1Yp6hvPxWxoZlMIQi1CgVJ) | Airtable base `appAec74Ux8EQrA27`, table `tblFyxQnKkOjeHdmk` | `site/jayleefit-inventory-catalog-data.json` | `@j_lee_is_me` |

The uploaded resale batch was assigned to **Magicdeals Wholesale Outlet**. Its 256 source images were uploaded to the dedicated Magicdeals folder and consolidated into 32 item records. The file location for every image is preserved in `site/magicdeals-image-file-manifest.csv`; record-level groupings and Drive file IDs are preserved in `site/magicdeals-inventory-records.csv` and the Magicdeals catalog file.

> **Separation rule:** Magicdeals and JayLeeFit assets, file IDs, records, catalog entries, modeled visuals, captions, and posts must never be written into the other company’s locations.

For both companies, the operating sequence is straightforward: assign the company, identify and group the source images, upload to that company’s Drive folder, save file IDs to that company’s database and catalog, create any requested modeled visuals, draft a company-specific Instagram post, and require explicit approval immediately before publishing.
