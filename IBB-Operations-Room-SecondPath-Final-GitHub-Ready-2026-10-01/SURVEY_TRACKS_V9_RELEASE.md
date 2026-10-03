# V9 — Ibb Road Survey Tracks Integration

## Source
Uploaded KML: `طرق اب.kml`

## Extraction
- KML placemarks: 13,018
- LineString elements found: 1,689
- Usable LineString tracks (>=2 valid coordinate points): 1,644
- Valid coordinate points retained: 87,991
- Single-point/invalid LineStrings are not rendered as road geometry.

## Product behavior
- The uploaded tracks are loaded at runtime from `/data/ibb-road-tracks.json`.
- They appear as an independent GIS survey layer in the official road network view.
- The layer can be shown/hidden without affecting the official route records.
- Uploaded geometry is NOT automatically asserted to be the centerline of a named official road.
- Official road geometry remains authoritative where an explicit verified match exists.
- Unmatched or partial survey geometry remains visible as survey evidence rather than being silently attached to the wrong road.

## Why this matters
The KML contains many unnamed paths and multiple segments. Keeping the survey layer independent prevents false matches while preserving every usable track for the next spatial matching pass.
