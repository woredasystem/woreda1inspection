# Quick Fix: Enable Public Access for R2 Bucket

The "File not found" error from Microsoft Office Online Viewer means your R2 bucket is **not set to public access**.

## Step-by-Step Fix

### 1. Go to Cloudflare Dashboard
- Visit: https://dash.cloudflare.com/
- Navigate to **R2** → Select your bucket (`woreda-documents`)

### 2. Enable Public Access
- Click on the **Settings** tab
- Scroll to **Public Access** section
- Click **Allow Access** or **Make Public**
- Confirm the action

### 3. Verify CORS Configuration
- Still in **Settings** → **CORS Policy**
- Add this configuration:
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
- Click **Save**

### 4. Test the Public URL
Try accessing a file directly in your browser:
```
https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev/woreda-documents/woreda-9/000/000/2017/Marketing%20Plan%20for%20_My%20Equb_.docx
```

If you see the file download or a 200 OK response, it's working!

### 5. Try Viewing Again
Go back to your documents page and try viewing the Office document again. It should work now.

## Alternative: Check Server Logs

Check your Next.js server console. You should see:
- `🧪 Testing public URL accessibility: ...`
- `📊 URL test response: ...`
- Either `✅ Public URL is accessible` or `❌ Public URL is NOT accessible`

If it says "NOT accessible", the bucket is not public. Follow steps 1-2 above.

## Still Not Working?

1. **Verify the bucket name** in `.env.local`:
   ```
   CLOUDFLARE_R2_BUCKET_NAME=woreda-documents
   ```

2. **Verify the public URL** in `.env.local`:
   ```
   CLOUDFLARE_R2_PUBLIC_URL=https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev
   ```

3. **Check file exists** in R2:
   - Go to Cloudflare Dashboard → R2 → Your bucket
   - Browse to the file path: `woreda-9/000/000/2017/`
   - Verify the file exists

4. **Test URL directly**:
   - Copy the public URL from the console
   - Paste it in a new browser tab
   - If it downloads/shows the file, it's accessible
   - If you get 404/403, the bucket is not public or the path is wrong

