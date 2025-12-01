# 🔴 CRITICAL FIX: Update Your .env.local File

## The Problem

Your `CLOUDFLARE_R2_PUBLIC_URL` is set to the **upload endpoint** instead of the **public URL**!

**Current (WRONG):**
```env
CLOUDFLARE_R2_PUBLIC_URL=https://2d69926d7712f9743e473909b1a2e7dd.r2.cloudflarestorage.com
```

**Should be (CORRECT):**
```env
CLOUDFLARE_R2_PUBLIC_URL=https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev
```

## Quick Fix

1. Open your `.env.local` file
2. Find `CLOUDFLARE_R2_PUBLIC_URL`
3. Change it to: `https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev`
4. Save the file
5. Run: `npm run fix-r2-urls`

## After Fixing

The URLs will be converted from:
```
https://2d69926d7712f9743e473909b1a2e7dd.r2.cloudflarestorage.com/woreda-9/000/000/2017/file.docx
```

To:
```
https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev/woreda-documents/woreda-9/000/000/2017/file.docx
```

Notice:
- Changed from `.r2.cloudflarestorage.com` to `.r2.dev`
- Added `/woreda-documents/` (bucket name) in the path for `pub-*.r2.dev` format

## Verify

After updating `.env.local` and running the fix script, test viewing a file. It should work!

