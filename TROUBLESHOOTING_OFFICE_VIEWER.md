# Troubleshooting Office Document Viewer

If you're seeing "File not found" errors when trying to view Office documents (DOCX, XLSX, PPTX), follow these steps:

## Step 1: Check Browser Console

Open your browser's Developer Tools (F12) and check the Console tab. You should see logs like:

- `📄 Loading Office document: [filename]`
- `🔗 Original file URL: [url]`
- `✅ Got public URL: [url]`
- `🌐 Constructing Office viewer URL...`
- `🔗 Office viewer URL: [url]`

If you see errors, note what they say.

## Step 2: Verify R2 Bucket is Public

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** → Your bucket (`woreda-documents`)
3. Click on **Settings** tab
4. Under **Public Access**, ensure it's set to **Public**
5. If it's not public:
   - Click **Allow Access** or **Make Public**
   - This enables public read access to all files

## Step 3: Check Public URL Format

Your `CLOUDFLARE_R2_PUBLIC_URL` in `.env.local` should be:
```
CLOUDFLARE_R2_PUBLIC_URL=https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev
```

**NOT** the upload endpoint like:
```
❌ CLOUDFLARE_R2_PUBLIC_URL=https://2d69926d7712f9743e473909b1a2e7dd.r2.cloudflarestorage.com
```

## Step 4: Test Public URL Directly

Try accessing a file directly in your browser. The URL should look like:
```
https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev/woreda-documents/woreda-9/000/000/2017/file.docx
```

If you get a 404 or access denied, the bucket is not public or the URL format is wrong.

## Step 5: Check CORS Configuration

Your R2 bucket needs CORS configured to allow the Office viewer to access files:

1. In Cloudflare Dashboard → R2 → Your bucket
2. Go to **Settings** → **CORS Policy**
3. Add this CORS configuration:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

## Step 6: Verify File URLs in Database

Run this in your Supabase SQL editor to check stored URLs:

```sql
SELECT id, file_name, r2_url 
FROM uploads 
WHERE file_name LIKE '%.docx' OR file_name LIKE '%.xlsx' OR file_name LIKE '%.pptx'
LIMIT 5;
```

The `r2_url` should be a public URL (`.r2.dev`), not an upload endpoint (`.r2.cloudflarestorage.com`).

If you see upload endpoints, run:
```bash
npm run fix-r2-urls
```

## Step 7: Check Server Logs

Look at your Next.js server console. You should see:
- `🔍 Processing file URL: ...`
- `✅ Constructed pub-*.r2.dev URL: ...`
- `🧪 Testing public URL accessibility: ...`
- `✅ Public URL is accessible and ready for Office viewer`

If you see errors, they'll tell you what's wrong.

## Common Issues

### Issue: "File not found" in Office viewer
**Solution**: R2 bucket is not public. Make it public in Cloudflare Dashboard.

### Issue: "The URL of the original file is not valid"
**Solution**: 
1. Check `CLOUDFLARE_R2_PUBLIC_URL` is set correctly
2. Run `npm run fix-r2-urls` to update database URLs
3. Verify bucket is public

### Issue: CORS error in console
**Solution**: Configure CORS in R2 bucket settings (see Step 5)

### Issue: 403 Forbidden when testing URL
**Solution**: Bucket is not public. Enable public access.

## Still Not Working?

1. Check all console logs (browser and server)
2. Verify the public URL works when accessed directly
3. Ensure CORS is configured
4. Make sure the bucket is truly public (not just "public read" but fully public)

