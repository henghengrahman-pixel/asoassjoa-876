# Audit and actual fixes

Architecture: built-in Node HTTP server, query-string forms, manual routes/session lookup/CSRF, scrypt passwords, TOTP enrollment, AES-256-GCM agent vault, atomic JSON on volume, public HTTPS feeds, HTML catalog/period parsers, vendor QR code. No SQL database or ORM. All original source files, vendor assets, routes and version notes are retained.

| Reproduction / bug | Root cause and affected file | Actual fix / evidence |
|---|---|---|
| Import a valid legacy JSON store containing an unknown field, then save | `readStore` returned a fixed field projection; server.js | Preserve original fields via spread, additive ptReports; HTTP restart and legacy tests |
| Reach 10,001 market records, 5,001 audits or 1,001 backtests | Implicit slicing discarded oldest persisted data; server.js, market-feed.js | Remove automatic retention slicing; UI limits remain display-only |
| Import malformed calendar date | Invalid Date `.toISOString()` throws 500; server.js | Validate finiteness before formatting; actual HTTP request returns 400 |
| Catalog has two IDs with same name or malformed percent encoding | Name-keyed Map collapses IDs; decodeURIComponent throws; agent-readonly.js | Key catalog by site-local ID; handle invalid URI; regression test |
| HTTP 200 page lacks valid period | Empty technical reason; agent-readonly.js | PERIOD_FIELD_NOT_FOUND; never infer success from HTTP status |
| Period exists only on explicitly selected period dropdown | Input-only parser; agent-readonly.js | Parse selected options only in period fields, preserve zeros; regression test |
| Catalog request redirects to login | Some catalog failures swallowed; agent-readonly.js | Expiration/login redirects propagate and authentication fails |
| DNS lookup stalls or large catalog requests repeatedly timeout | DNS not bounded and only per-request deadlines; agent-readonly.js, market-feed.js | Whole agent deadline and bounded DNS/feed reads; stalled-fetch/DNS tests |
| Large HTML body streamed upstream | Buffering entire body before size validation; agent-readonly.js | Stream with hard size ceiling; reject oversized body in test |
| IPv4-mapped private IPv6 resolves | Incomplete agent IP policy; agent-readonly.js | Reuse published-feed reserved-address policy; rejection test |
| Invalid cookie saved, or website names collide | Cookie only validated when probing; feed mapping keyed by duplicate name; server.js | Validate cookie before save; reject duplicate names; enforce URL origin/session scope |
| Enrolled TOTP is readable directly in JSON | Plaintext security.totpSecret; server.js | Non-destructive encryption on next save using ENV key; same OTP continues working; legacy test and actual process restart |
| POST login sent cross-origin | No login origin guard; server.js | Reject cross-site browser metadata or mismatched Origin; legacy test |
| Server exceptions/log caching leak sensitive context | Full Error object and no blanket private-page cache control; server.js | Log exception type only; no-store for authenticated/auth pages and exports |
| More than 12 websites or a filtered analysis total | First 12 columns but ALL counted all records; server.js | Show selected registered websites and calculate historical frequency within that selection |
| Report PT unavailable | No actual structured module; server.js/public | Add pt-reports.js, authenticated import/recap/export endpoints, dedicated menu and file picker |
| Mixed exact periods, duplicate files, fabricated missing zeros | Missing report schema/persistence | Strict source schema, immutable conflicts, exact string period matching, null semantics, deterministic identities and atomic merge |
| Dangerous formula text / pseudo Excel file | Export absent | True OOXML ZIP with typed number/text cells; CSV header formula guarding; independently opened with openpyxl |
| PT module omitted from container | New runtime dependency not copied | Update Dockerfile to include module and lockfile; DATA_DIR default /data; Docker execution unverified |
| Quoted .env value parsed literally | Minimal environment loader; server.js | Strip enclosing quote pair while preserving ENV precedence |

Existing routes inspected: login/logout, QR/setup/activate/cancel 2FA, website create/update/delete, session check/revoke, market sync/import, backtest, all view navigation, health and static assets. New PT endpoints sit behind the same authenticated-stage and CSRF gates. No report endpoint forwards candidate numbers or makes settlement/draw writes.

Known limits: no live agent account or Railway access; parser authentication proof remains specific to known source HTML markers; DNS preflight is not connection-pinned; one-replica JSON storage; source report authenticity is the uploader's responsibility; browser/Docker execution unavailable. See TEST-REPORT.md. These are not marked as passed.
