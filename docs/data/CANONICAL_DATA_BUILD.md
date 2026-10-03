# Canonical data build — 2026-09-30

## Production source

The canonical initiative registry is the workbook **مبادرات الطرق المدعومة من وحدة التدخلات في محافظة إب للمنصة.xlsx**.

- 725 initiative rows were read from `مبادرات الطرق إب`, rows 6–730.
- Initiative identity is taken from the canonical registry.
- Current Second Executive Pathway fields are overlaid from `مصفوفة الفرز`.
- Study work quantities and EXC identity are taken from `مصفوفة مستوى الانجاز والتقييم` when a matching project code exists.
- No synthetic initiative records are generated.

## Identity rules

- Arabic identity matching normalizes common Arabic letter variants only for matching.
- The stored initiative name remains the source value.
- `EXC_*` remains the work-item identity from the evaluation matrix and is not replaced by a generated label.
- Legacy `خلاصات مدمجة`, `مصفوفة الفرز (2)`, and duplicate operational matrices are not authoritative runtime sources.

## Verification snapshot

- Canonical registry rows: **725**
- Second Path sorting-name matches: **725/725**
- Evaluation-matrix code matches: **711/725**
- Missing initiative codes after matching: **0**
- Synthetic records: **0**

The 14 initiatives without an evaluation-matrix code match retain their canonical initiative identity and Second Path data; their evaluation work-item payload is empty rather than fabricated.
