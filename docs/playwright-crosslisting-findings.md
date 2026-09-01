# Playwright cross-listing test findings

## Outcome

A **draft-first cross-listing workflow works** for this repository. The deterministic helper at `tools/crosslist_prep.py` converts one master CSV row into four reviewable JSON drafts: Poshmark, Mercari, Depop, and Facebook Marketplace. It applies destination-specific title limits, formats descriptions, preserves image paths, and marks every output with `review_required: true` and `submit_automatically: false`.

## Tests completed

| Test | Result | Evidence |
|---|---|---|
| Generate drafts from the sample CSV | PASS | Four JSON files were created under platform-specific directories. |
| Validate output safety flags | PASS | Every draft requires review and disables automatic submission. |
| Validate destination title handling | PASS | The Mercari fixture title remained within the configured 40-character limit. |
| Playwright browser startup | PASS | Firefox runtime was installed and navigated to a public smoke-test page. |
| Playwright form fill | PASS | A local marketplace-like form accepted title, price, description, and image-path values. |
| Submission boundary | PASS | The `Publish listing` button remained untouched; the test stopped after filling and inspecting the form. |

## Recommended operating pattern

Use Playwright as a **form-preparation assistant**, not as an unattended publishing bot. For each destination, open the new-listing form, confirm the user is logged in, fill fields from the matching JSON draft, upload or select images, and stop before controls labeled `Publish`, `Post`, `List`, `Submit`, or equivalent. The owner should inspect the completed form and perform the final submission manually.

If a login wall, CAPTCHA, identity verification, policy warning, payment step, or unexpected page appears, stop and request user takeover. Marketplace-specific selectors should live in a separate adapter because UI labels and form layouts change. Credentials must never be committed to this repository.

## Known limitations

The current helper does not authenticate, upload images, select shipping settings, check inventory collisions, validate authenticity, or submit listings. It also does not claim that a destination permits a particular item or description. Those checks remain human responsibilities before publication.

## Usage

```bash
python3 tools/crosslist_prep.py tools/crosslist_sample.csv /tmp/crosslist-drafts
```

The full operating guide is in `tools/CROSSLISTING.md`.
