# Canonical resource source policy — 2026-10-05

## Approved contribution quantities

For the Second Executive Pathway, the authoritative source for approved contribution quantities is the Excel sheet `مصفوفة الفرز`.

- Cement approved: column `V`
- Diesel approved: column `AA`
- Other material type/unit: column `AF`
- Other approved quantity: column `AG`

`خلاصات مدمجة` and `مصفوفة مستوى الانجاز والتقييم` are not allowed to overwrite these approved contribution quantities at runtime.

## Runtime interpretation

- Approved quantity = canonical commitment from `مصفوفة الفرز`.
- Received quantity = operational receipt/movement data.
- Used quantity = field execution data.
- Site remaining = current custody at initiative.
- Commitment remaining = approved quantity not yet delivered.
- Transfers and write-offs remain separate auditable movements.
- Cost, community contribution, and unit contribution are financial fields and are not inferred from material quantities.

## Implementation

`normalizeInitiativeRecord()` resolves the sorting resource source by normalized initiative name, with district/sub-district as the stronger key and a unique-name fallback.

The build step `scripts/buildSortingResources.ts` regenerates the runtime source from the canonical workbook template before `dev`, `build`, and `lint`.

The source workbook remains unchanged.
