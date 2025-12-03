# Security Review

## React Server and CVE-2025-55183
- The frontend uses React 18.2.0 (`frontend/package.json`), which predates React 19.0-19.2 that are affected by CVE-2025-55183. No React Server or experimental server components are enabled in the current Vite-based client build, so the project is not exposed to this issue.

## Dependency audit
- Ran `npm audit --production` in `frontend/` after updating dependencies; the report shows **0 vulnerabilities**.
- Upgraded `axios` from `^1.3.4` to `^1.13.2` to address a high-severity denial-of-service advisory (GHSA-4hjh-wcwx-xvwj) affecting versions 1.0.0 through 1.11.0.

## Recommendations
- Keep React pinned below 19.0 until adopting the patched 19.x release that remediates CVE-2025-55183, or verify the vulnerability fix before upgrading.
- Re-run `npm audit --production` as part of CI to catch future advisories.
