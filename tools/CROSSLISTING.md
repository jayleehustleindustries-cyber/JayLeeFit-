# Cross-listing draft helper

This helper converts one master CSV into marketplace-specific JSON drafts for **Poshmark, Mercari, Depop, and Facebook Marketplace**. It is intentionally **draft-first**: it does not log in, upload files, click Publish, or submit any transaction. The resulting JSON is the structured handoff that a Playwright operator can use to fill a marketplace form while the owner reviews the page and performs the final submission.

## Input format

The CSV must include `sku`, `brand`, `title`, `size`, `condition`, `price`, `description`, and `image_paths`. Separate image paths with `|` or `;`. Optional columns are `category`, `color`, `flaws`, and `hashtags`.

## Generate drafts

From the repository root, run:

```bash
python3 tools/crosslist_prep.py tools/crosslist_sample.csv /tmp/crosslist-drafts
```

To create drafts for only selected destinations:

```bash
python3 tools/crosslist_prep.py inventory.csv ./drafts --platforms poshmark mercari
```

Each output file contains a platform-specific title, price, description, image list, source SKU, and explicit safety flags: `review_required: true` and `submit_automatically: false`.

## Playwright operating pattern

The recommended browser sequence is: open the destination marketplace; verify the user is already logged in; navigate to the new-listing form; fill title, price, description, and images from the matching JSON draft; stop before any button labeled `Publish`, `Post`, `List`, `Submit`, or equivalent; capture a screenshot or accessibility snapshot for review; then let the owner make the final decision and click the submission control manually. If a login, CAPTCHA, identity check, payment step, or policy warning appears, stop and request user takeover instead of attempting to bypass it.

This pattern is deliberately generic because marketplace selectors and policies change. Keep destination-specific selectors in a separate local Playwright adapter, and never store credentials in the repository. The JSON generator remains deterministic and testable even when a marketplace UI changes.

## Validation and limitations

The helper rejects missing required fields, missing images, unsupported platforms, and non-positive prices. It does not verify brand authenticity, marketplace policy compliance, shipping settings, taxes, inventory availability, or whether an item is already listed. Review those items before submission.

## Test fixture

The sample command should produce four files under `/tmp/crosslist-drafts/{poshmark,mercari,depop,facebook}/JF-TEST-001.json`. The fixture uses placeholder image paths and is not intended for publication.
