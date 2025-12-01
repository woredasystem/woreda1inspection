# How to Make R2 Files Publicly Accessible

This guide explains how to configure Cloudflare R2 to make files publicly accessible so they can be viewed in the browser and with Microsoft Office Online Viewer.

## Method 1: Using R2 Public URL (Recommended)

### Step 1: Enable Public Access in Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** → **Manage R2 API Tokens**
3. Select your bucket (e.g., `woreda-documents`)
4. Go to **Settings** tab
5. Under **Public Access**, click **Allow Access**
6. Choose one of these options:
   - **Custom Domain**: Use your own domain (e.g., `files.yourdomain.com`)
   - **R2.dev Subdomain**: Use Cloudflare's free subdomain (e.g., `your-bucket.r2.dev`)

### Step 2: Configure Custom Domain (Optional but Recommended)

If using a custom domain:

1. In R2 bucket settings, click **Connect Domain**
2. Enter your domain (e.g., `files.woreda9.gov`)
3. Follow the DNS setup instructions
4. Wait for DNS propagation (usually 5-10 minutes)

### Step 3: Update Environment Variables

Update your `.env.local` file:

```env
# R2 Upload URL (for API uploads)
CLOUDFLARE_R2_UPLOAD_URL=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com/woreda-documents

# R2 Public URL (for public access)
# IMPORTANT: Use the exact URL from Cloudflare Dashboard
# Format: https://pub-ACCOUNT_ID.r2.dev (without trailing slash)
CLOUDFLARE_R2_PUBLIC_URL=https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev

# Or if using custom domain:
# CLOUDFLARE_R2_PUBLIC_URL=https://files.yourdomain.com
```

**Important Notes:**
- Do NOT include a trailing slash in the URL
- The URL should be exactly as shown in Cloudflare Dashboard
- Files will be accessible at: `{PUBLIC_URL}/{woreda-id}/{category}/{subcategory}/{year}/{filename}`

### Step 4: Configure CORS

Run the CORS configuration script:

```bash
npm run configure-r2-cors
```

Or manually configure CORS in the Cloudflare Dashboard:

1. Go to your R2 bucket
2. Navigate to **Settings** → **CORS Policy**
3. Add the following CORS configuration:

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

## Method 2: Using API Proxy (Current Implementation)

If you prefer to keep files private and use the API proxy (current setup):

The current implementation uses `/api/view-file` which:
- Validates access tokens
- Proxies files securely
- Works with Office Viewer

This method is already configured and working. No additional setup needed.

## Verification

To verify public access is working:

1. Upload a test file through the admin panel
2. Copy the R2 URL from the database
3. Try accessing it directly in a browser:
   ```
   https://your-public-url.com/woreda-9/category/subcategory/year/file.pdf
   ```
4. If it loads, public access is configured correctly!

## Troubleshooting

### Files still not accessible?

1. **Check bucket settings**: Ensure "Allow Access" is enabled
2. **Verify URL format**: Make sure `CLOUDFLARE_R2_PUBLIC_URL` matches your configured domain
3. **Check CORS**: Ensure CORS is configured to allow your origin
4. **DNS propagation**: If using custom domain, wait for DNS to propagate
5. **File permissions**: Ensure files are uploaded with public-read ACL (handled automatically by the upload script)

### Office Viewer still shows "File not found"?

1. Ensure the public URL is HTTPS (required by Office Viewer)
2. Check that CORS allows requests from `view.officeapps.live.com`
3. Verify the file URL is accessible without authentication
4. Try accessing the file directly in a browser first

## Security Considerations

⚠️ **Important**: Making R2 files publicly accessible means anyone with the URL can access them.

**Recommendations:**
- Use the API proxy method (Method 2) for sensitive documents
- If using public access, consider:
  - Using long, unpredictable file names
  - Implementing URL signing/expiration
  - Using Cloudflare Access for additional protection
  - Restricting access by IP if possible

## Next Steps

After configuring public access:

1. Test file viewing in the browser
2. Test Office document viewing
3. Update your deployment environment variables
4. Monitor access logs in Cloudflare Dashboard

