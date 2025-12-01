# Quick Fix for R2 Public Access

## Your R2 Public URL
```
https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev
```

## Steps to Fix

### 1. Update `.env.local`

Make sure your `.env.local` has:

```env
CLOUDFLARE_R2_PUBLIC_URL=https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev
```

**Important:** No trailing slash!

### 2. Verify Public Access is Enabled

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** → Your bucket
3. Go to **Settings** tab
4. Under **Public Access**, make sure it says **"Enabled"**
5. If not, click **"Allow Access"** and choose **"R2.dev Subdomain"**

### 3. Test the URL

Run this command to test:
```bash
npm run test-r2-url
```

This will:
- Show you the constructed URLs
- Test if files are accessible
- Help identify any issues

### 4. Verify File Access

Try accessing a file directly. The URL format should be:
```
https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev/woreda-9/000/000/2024/your-file.pdf
```

Replace:
- `woreda-9` with your actual woreda ID
- `000/000/2024/your-file.pdf` with the actual file path

### 5. Common Issues

**Issue: "Access Denied" or 403 Error**
- Solution: Enable public access in Cloudflare Dashboard (Step 2)

**Issue: "File Not Found" or 404 Error**
- Solution: Check the file path is correct
- Verify the file was uploaded successfully
- Check the `r2_url` in your database matches the public URL format

**Issue: CORS Error**
- Solution: Run `npm run configure-r2-cors`

**Issue: Office Viewer Still Shows "File Not Found"**
- Solution: The file must be publicly accessible (no authentication)
- Try accessing the file directly in a browser first
- If it works in browser but not in Office Viewer, it's a CORS issue

### 6. Alternative: Use API Proxy (Current Setup)

If public access doesn't work, the current API proxy (`/api/view-file`) should still work. It:
- Validates access tokens
- Proxies files securely
- Works with Office Viewer

The API proxy is already configured and working!

