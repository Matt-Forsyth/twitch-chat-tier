# 🔧 HOTFIX - v0.0.21 Deployment Package

## ❌ Problem Identified

The original `twitch-extension-v0.0.21.zip` package included both:
- Development HTML files (in root) pointing to `/src/panel.tsx`
- Built production files (in dist folder) with proper asset references

**Error**: Twitch was loading the dev HTML files which tried to load source TypeScript files that don't exist in the package, resulting in:
```
NS_ERROR_CORRUPTED_CONTENT
GET https://[extension-id].ext-twitch.tv/src/panel.tsx
Status 400
```

## ✅ Solution

Created **corrected package**: `twitch-extension-v0.0.21-fixed.zip`

This package contains ONLY the production-built files from the `dist` folder:
- ✅ Production HTML files with proper asset references
- ✅ Bundled JavaScript files (config, panel, global, api)
- ✅ Compiled CSS
- ✅ All necessary assets

## 📦 Use This Package

**Correct File**: `frontend/twitch-extension-v0.0.21-fixed.zip` (105 KB)
~~**Incorrect File**: `frontend/twitch-extension-v0.0.21.zip` (108 KB)~~ ❌

## 🚀 Upload Instructions

1. **Delete old version** from Twitch (if uploaded)
2. **Upload** `twitch-extension-v0.0.21-fixed.zip`
3. **Test** in hosted test mode
4. All panels should now load correctly

## 📋 Package Contents

```
twitch-extension-v0.0.21-fixed.zip
├── config.html                        (production build)
├── panel.html                         (production build)
├── mobile.html                        (production build)
├── video_component.html               (production build)
├── video_overlay.html                 (production build)
└── assets/
    ├── panel-DXjdvASW.js             (120 KB)
    ├── config-DOy3mtWv.js            (16 KB)
    ├── global-CDoXnR_1.js            (143 KB)
    ├── api-LyJ_JTCH.js               (40 KB)
    ├── video_overlay-BPOFc3lu.js     (2 KB)
    ├── video_component-CIDxvHHL.js   (0.4 KB)
    └── global-DGhGgRwt.css           (2.5 KB)
```

## ✅ Verification

Production HTML files correctly reference bundled assets:
```html
<!-- panel.html -->
<script type="module" crossorigin src="./assets/panel-DXjdvASW.js"></script>
<link rel="stylesheet" crossorigin href="./assets/global-DGhGgRwt.css">
```

NOT the source files:
```html
<!-- ❌ WRONG (dev files) -->
<script type="module" src="/src/panel.tsx"></script>
```

## 🎯 What This Fixes

- ✅ Config panel loads correctly
- ✅ Viewer panel loads correctly
- ✅ All JavaScript bundles load properly
- ✅ CSS styles apply correctly
- ✅ No more CORS or 400 errors

## 📝 Note for Future Builds

When creating deployment packages for Twitch extensions, always:
1. Run `npm run build` to generate production files
2. **Navigate INTO the dist folder**: `cd frontend/dist`
3. Create zip from inside dist: `zip -r ../twitch-extension-vX.X.X.zip .`
4. This ensures HTML files at root of zip are the production builds

**Don't** zip from the frontend root and include dist as a subfolder!
