# Enable Public R2.dev Domain - Step by Step

Your files exist in R2, but the **public R2.dev domain is not enabled**. This is required for Office documents to be viewable.

## Exact Steps to Enable Public Domain

### Step 1: Navigate to Your Bucket
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **R2** in the left sidebar
3. Click on your bucket: **woreda-documents**

### Step 2: Find Public Access Settings
Look for one of these options:

**Option A: In the Overview Tab**
- Look for a button or card that says:
  - "Connect Domain"
  - "Enable Public Access"
  - "Public R2.dev Subdomain"
  - "R2.dev Subdomain"

**Option B: In the Settings Tab**
- Scroll down to find:
  - "Public Access" section
  - "Public R2.dev Subdomain" section
  - "Domains" section
  - "Public Domain" section

### Step 3: Enable the Domain
1. You should see: `pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev`
2. Click **Enable** or **Create** or **Activate**
3. Wait 5-10 minutes for activation
4. The status should change to **Active** or **Enabled**

### Step 4: Verify It's Working
After enabling, test this URL in your browser:
```
https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev/woreda-documents/woreda-9/000/000/2017/Marketing%20Plan%20for%20_My%20Equb_.docx
```

- ✅ **File downloads** → It's working!
- ❌ **404 Not Found** → Domain not enabled or not bound
- ❌ **403 Forbidden** → Bucket not public

## If You Can't Find the Option

### Check Your Plan
- Some Cloudflare plans may not include public R2.dev domains
- Check if you see any "Upgrade" prompts related to R2

### Alternative: Use Custom Domain
1. Set up a custom domain (e.g., `files.yourdomain.com`)
2. Bind it to your R2 bucket
3. Update `CLOUDFLARE_R2_PUBLIC_URL` in `.env.local` to your custom domain

### Contact Support
If you can't find the option, contact Cloudflare support and ask:
> "How do I enable the public R2.dev subdomain for my R2 bucket?"

## What You Should See

When properly configured, you should see:
```
Public R2.dev Subdomain: pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev
Status: Active ✅
```

## Quick Test Command

Run this to test if the domain is active:
```bash
curl -I "https://pub-fcc35482a42b44e989b242c288d0d9e1.r2.dev/woreda-documents/woreda-9/000/000/2017/Marketing%20Plan%20for%20_My%20Equb_.docx"
```

If you get `HTTP/2 200`, it's working! 🎉

