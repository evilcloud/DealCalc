# DealCalc iPhone web app pack

This is a standalone, iPhone-ready static version of your calculator.

## What changed
- Added iPhone / Home Screen web-app metadata
- Added `manifest.webmanifest`
- Added `sw.js` for offline caching
- Added app icons
- Added safe-area handling for iPhone
- Added `inputmode` so iPhone shows a numeric keyboard
- Fixed `otherExpenses` live recalculation / formatting
- Added local autosave to `localStorage`

## Deploy
Upload these files to the same static host you already use (for example Vercel).
