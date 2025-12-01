# Verify R2 Public Access Configuration

Your files exist in R2 but are returning 404. This means the bucket is **not fully configured for public access**.

## Step-by-Step Fix

### 1. Enable Public Access (Domain)

In Cloudflare Dashboard → R2 → Your bucket (`woreda-documents`):

1. Go to **Settings** tab
2. Scroll to **Public Access** section
3. Look for **Public R2.dev Subdomain** or **Custom Domain**
4. You should see: `https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev`
5. If it says "Not configured" or "Disabled", click **Enable** or **Create**

### 2. Verify Domain is Active

The public domain should show as **Active** or **Enabled**. If it's pending or disabled, wait a few minutes for it to activate.

### 3. Check Domain Binding

Make sure the domain `pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev` is:
- ✅ Bound to your bucket
- ✅ Active/Enabled
- ✅ Not showing any errors

### 4. Test Direct Access

Try accessing this URL directly in your browser:
```
https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev/woreda-documents/woreda-9/000/000/2017/Marketing%20Plan%20for%20_My%20Equb_.docx
```

**Expected results:**
- ✅ **200 OK** → File downloads → Public access is working!
- ❌ **404 Not Found** → Domain not bound or bucket not public
- ❌ **403 Forbidden** → Bucket is not public
- ❌ **Connection error** → Domain not configured

### 5. Alternative: Use Custom Domain

If the `pub-*.r2.dev` domain isn't working, you can:
1. Set up a custom domain in Cloudflare
2. Update `CLOUDFLARE_R2_PUBLIC_URL` in `.env.local` to your custom domain
3. Bind the custom domain to your bucket

### 6. Verify CORS

Even if public access works, you need CORS for the Office viewer:

1. Go to **Settings** → **CORS Policy**
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

## Common Issues

### Issue: Domain shows as "Pending"
**Solution**: Wait 5-10 minutes for Cloudflare to activate the domain. Refresh the page.

### Issue: Domain shows as "Error"
**Solution**: 
- Check if there are any error messages
- Try disabling and re-enabling the domain
- Contact Cloudflare support if it persists

### Issue: 404 even after enabling
**Solution**: 
- Verify the bucket name in the URL matches exactly: `woreda-documents`
- Check that files exist at the exact paths shown
- Try accessing a file without the bucket name in the path (if using bucket subdomain format)

## Quick Test

Run this command to test if the domain is accessible:
```bash
curl -I "https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev/woreda-documents/woreda-9/000/000/2017/Marketing%20Plan%20for%20_My%20Equb_.docx"
```

If you get `HTTP/2 200`, it's working! If you get `404`, the domain isn't properly configured.

