# CEDIU IBB data ownership and periodic matrix outputs

## Runtime source of truth

Firestore is the authoritative runtime store for the platform. Operational updates made through the platform are written to Firestore for authenticated users. Demo mode remains local-only.

## Foundation/import sources

The following sources are used during the controlled foundation migration and reconciliation only:

- Existing canonical initiative dataset (the current 725 initiative baseline).
- `مصفوفة الفرز`: import fields that belong to sorting/diagnosis/resources/decisions according to the approved field map.
- `مصفوفة مستوى الإنجاز والتقييم`: import work-item names, units, evaluation data, and preserve `EXC`.
- Studies: import structured study information linked to the initiative.
- Cement/diesel ledgers: import historical resource movements and opening balances when mapped.
- `خلاصات مدمجة`: historical reference only; not a runtime source of truth.
- `المصفوفات التشغيلية الرئيسية(2)`: duplicate of the evaluation matrix; do not treat as a separate source.
- `المصفوفات التشغيلية الرئيسية(3)`: not an authoritative source.

## Runtime model

An initiative is the aggregation point. Runtime workflows write structured records linked by `initiativeId`, including field visits, work progress, resources/resource movements, assessments, recommendations, decisions, actions, transfers, documents, and audit history.

A report/form is an output over runtime data, not another operational database.

## Periodic outputs

The operational matrices are **outputs**, not runtime databases:

1. Generate `مصفوفة الفرز.xlsx` from current Firestore data using the approved original Excel template.
2. Generate `مصفوفة مستوى الإنجاز والتقييم.xlsx` from current Firestore data using the approved original Excel template.
3. Generate PDF versions from the same report dataset/layout for weekly or monthly submission.
4. Preserve issued snapshots so a submitted weekly/monthly report remains historically reproducible even after later runtime changes.

The source Excel templates are never updated by runtime workflows.

## Important sequencing

Do not seed the 725 baseline into Firestore as the final migration until the source-to-field reconciliation is completed. The existing bootstrap helper is intentionally not invoked automatically by the application.

## Current implementation milestone

The application now reads Firestore first when available and persists initiative create/update/delete operations to Firestore for authenticated users. The remaining migration work is to implement the controlled source reconciliation/import and the template-based Excel/PDF output pipeline.
