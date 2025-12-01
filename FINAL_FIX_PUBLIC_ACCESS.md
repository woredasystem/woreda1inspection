# Final Fix: Public Development URL Not Working

The domain is enabled, but files are still 404. Here's what to check:

## Issue: Domain Enabled But Files Not Accessible

### Possible Causes:

1. **Domain Just Enabled - Needs Time**
   - Public development URLs can take 5-15 minutes to fully activate
   - Wait a few minutes and try again

2. **Bucket Not Set to Public**
   - Enabling the domain ≠ making the bucket public
   - Check if there's a separate "Public Access" toggle

3. **Path Format Issue**
   - The public development URL might use a different path format

## Steps to Fix:

### Step 1: Wait and Retry
1. Wait 10-15 minutes after enabling the domain
2. Try accessing this URL directly in your browser:
   ```
   https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev/woreda-documents/woreda-9/000/000/2017/Marketing%20Plan%20for%20_My%20Equb_.docx
   ```

### Step 2: Check for Separate Public Access Setting
In Cloudflare Dashboard → R2 → woreda-documents → Settings:

Look for:
- A toggle or checkbox for "Public Access" or "Allow Public Access"
- A section that says "Bucket Access" or "Access Control"
- Any setting that controls whether the bucket contents are publicly readable

### Step 3: Verify Domain Status
1. Go to Settings → Public Development URL
2. Check if it shows:
   - ✅ **Active** or **Enabled**
   - ⚠️ **Pending** (wait for it to activate)
   - ❌ **Error** (there's a problem)

### Step 4: Test with a Simple File
1. Upload a test file (e.g., `test.txt`) to your bucket
2. Try accessing it at:
   ```
   https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev/woreda-documents/test.txt
   ```
3. If this works, the issue is with the file paths
4. If this doesn't work, the domain isn't fully configured

### Step 5: Check CORS (If Domain Works But Office Viewer Fails)
If files become accessible but Office viewer still fails:
1. Go to Settings → CORS Policy
2. Add this configuration:
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

## Alternative: Use Custom Domain

If public development URL doesn't work:
1. Set up a custom domain (e.g., `files.yourdomain.com`)
2. Bind it to your R2 bucket
3. Update `CLOUDFLARE_R2_PUBLIC_URL` in `.env.local`

## Quick Test

Run this command to test:
```bash
npm run test-public-url
```

Or test manually in browser:
```
https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev/woreda-documents/woreda-9/000/000/2017/Marketing%20Plan%20for%20_My%20Equb_.docx
```

## If Still Not Working

Contact Cloudflare support and ask:
> "I enabled the public development URL for my R2 bucket, but files return 404. The domain shows as enabled. What am I missing?"

They can check:
- Domain activation status
- Bucket public access settings
- Any configuration issues

