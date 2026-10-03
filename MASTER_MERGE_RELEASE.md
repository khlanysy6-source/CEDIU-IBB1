# IBB Road Leadership — Master Merge Release

This release uses the original Google AI Studio application as the functional baseline and merges the V10 leadership/GIS/security enhancements without replacing the original executive experience.

## Included
- Original application portals and executive experience.
- Adaptive role-aware navigation.
- Leadership Operating System and leadership-facing decision view.
- Data Trust card and existing governance/intelligence layers.
- Official road network from initiative endpoints and execution data.
- Filtered Google Earth/KML road-track layer inside Ibb.
- Spatial/nominal route matching with confirmed/probable/unmatched states.
- Ibb boundary display.
- Security/RBAC hardening and Firestore rules from the audited V10 line.
- Security regression, data, route and UI validation scripts.
- ASCII-safe utility module filenames for Vite/Rollup portability; Arabic function names remain intact.

## Important integrity rule
No road geometry is invented from endpoints. Endpoint lines are only a visual fallback for records without verified geometry. Survey/KML tracks remain independent until a supported match exists.

## Build verification status
Static repository checks passed: JSON parsing, relative import resolution, route-track data presence, and Arabic utility filename portability checks.
A full npm/Vite production build was not executed in this environment because dependency installation did not complete within the available execution window. The release therefore must be treated as build-ready, not as a falsely claimed build-certified artifact.
