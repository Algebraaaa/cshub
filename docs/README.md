# Project Docs

This directory keeps long-form project documentation out of the repository root.

## Architecture & Process

- `docs/ARCHITECTURE.md` - system architecture overview.
- `docs/OPTIMIZATION_ROADMAP.md` - performance/security optimization roadmap (P0/P1/P2).
- `docs/FRONTEND_SELF_CHECK.md` - 12-dimension self-check for non-expert vibe-coded frontends.
- `docs/CHANGELOG.md` - consolidated feature change history (merged from prior one-off summaries).

## Guides

Living docs — keep these accurate.

- `docs/guides/CODE_HIGHLIGHTING_GUIDE.md` - code line highlighting: usage, `.line()` mapping, resolution order, troubleshooting.
- `docs/guides/SIDEBAR_GUIDE.md` - collapsible sidebar: usage, layout thresholds, implementation.
- `docs/guides/RESIZABLE_SPLIT_PANEL_GUIDE.md` - split panel behavior and integration notes.
- `docs/guides/THEME_GUIDE.md` - theme tokens and visual system notes.

## Examples

- `docs/examples/EXAMPLE_CODE_LINES.js` - reference data for code line highlighting (legacy `cppLine` style).

## Reports

Point-in-time integration reports for specific content additions.

- `docs/reports/ALGORITHM_INTEGRATION_REPORT.md`
- `docs/reports/INFORMATION_THEORY_INTEGRATION_REPORT.md`
- `docs/reports/ML_OPTIMIZATION_INTEGRATION_REPORT.md`

## Archive

Superseded one-off delivery summaries, kept for history. **Do not read these as
current truth** — their layout thresholds and `cppLine` conventions are stale.
See `docs/CHANGELOG.md` for what replaced them.

- `docs/archive/CHANGES_SUMMARY.md`
- `docs/archive/CODE_CHANGES_LOG.md`
- `docs/archive/COMPLETION_SUMMARY.md`
- `docs/archive/DELIVERY_CHECKLIST.md`
- `docs/archive/FINAL_IMPLEMENTATION_SUMMARY.md`
- `docs/archive/SIDEBAR_COMPLETION_SUMMARY.md`
- `docs/archive/SIDE_BY_SIDE_IMPLEMENTATION.md`
- `docs/archive/QUICK_START.md`
- `docs/archive/QUICK_REFERENCE.md`
- `docs/archive/SIDEBAR_QUICK_START.md`
- `docs/archive/SIDEBAR_COLLAPSIBLE_FEATURE.md`

> Note on the doc-drift guard (`src/data/docConsistency.test.js`): its `IS_ARCHIVE`
> filename filter applies only to root-level Markdown. Everything under `docs/`,
> including `reports/` and `archive/`, is still scanned for broken repo paths.
