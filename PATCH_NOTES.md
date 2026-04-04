This build preserves the original DealCalc calculator behavior and config flow, with only iPhone web-app shell changes added.

What changed:
- Restored the original calculation logic from the repo.
- Restored preset/default loading behavior with inline-config fallback for file:// and iPhone local use.
- Removed local autosave/state override.
- Removed service worker caching to avoid stale app/config behavior on iPhone.
- Added iPhone home-screen metadata, manifest, and Apple touch icon support.
- Kept the existing UI structure and preset placement aligned with the original app.
