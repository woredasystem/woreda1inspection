# Multi-Woreda Setup Guide

## Current Architecture

The system supports multiple woredas with **data separation** but **shared authentication**.

### ✅ What's Separated (Per Woreda):

1. **Files/Documents**
   - Stored in R2 with folder structure: `{woreda-id}/category/subcategory/year/filename`
   - Database records filtered by `woreda_id`
   - Each woreda only sees their own documents

2. **QR Codes**
   - Generated per woreda with unique codes
   - Requests stored with `woreda_id`
   - Each woreda only sees their own QR requests

3. **Temporary Access Tokens**
   - Scoped to specific `woreda_id`
   - Users can only access documents for their woreda

### ⚠️ What's Shared:

1. **Admin Authentication**
   - All woredas use the same Supabase project for authentication
   - Admin users are shared across all woredas
   - **Solution**: Each woreda needs separate Supabase projects OR add woreda assignment to user metadata

## Setup Options

### Option 1: Separate Supabase Projects (Recommended for Production)

Each woreda gets its own Supabase project:

1. **Create separate Supabase project** for each woreda
2. **Set environment variables** per deployment:
   ```env
   NEXT_PUBLIC_WOREDA_ID=woreda-9
   NEXT_PUBLIC_WOREDA_NAME=Woreda 9 Administration
   NEXT_PUBLIC_SUPABASE_URL=https://woreda9-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=woreda9-anon-key
   SUPABASE_URL=https://woreda9-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=woreda9-service-key
   ```

3. **Deploy separately** (one Vercel/production instance per woreda)

**Pros:**
- Complete isolation
- Separate admin logins
- Independent scaling
- Better security

**Cons:**
- More Supabase projects to manage
- More deployments

### Option 2: Shared Supabase with Woreda Assignment ✅ IMPLEMENTED

Use one Supabase project but assign admins to woredas:

1. **✅ `woreda_id` stored in user metadata** in Supabase Auth
2. **✅ Admin dashboard filtered** by user's assigned woreda
3. **✅ Create admin users** with woreda assignment via script

**How it works:**
- Each admin user has `woreda_id` in their `user_metadata`
- All admin functions automatically filter by the logged-in user's `woreda_id`
- Files, QR requests, and documents are scoped to the user's woreda
- Falls back to `NEXT_PUBLIC_WOREDA_ID` environment variable if user metadata is missing

**Creating admin users:**
```bash
npm run create-admin <email> <password> <woreda-id>
# Example:
npm run create-admin admin@woreda9.gov Admin@123456 woreda-9
npm run create-admin admin@woreda10.gov Admin@123456 woreda-10
```

**Pros:**
- ✅ Single Supabase project
- ✅ Centralized management
- ✅ Automatic filtering by user's woreda
- ✅ No code changes needed per woreda

**Cons:**
- Requires assigning woreda_id when creating users

## Current Implementation

The system **already filters data by `woreda_id`**:
- ✅ Documents are filtered
- ✅ QR requests are filtered (after fix)
- ✅ Uploads are scoped to woreda

**What you need to do:**

1. **For separate logins**: Use Option 1 (separate Supabase projects)
2. **For shared infrastructure**: Use Option 2 (add woreda assignment to users)

## Environment Variables Per Woreda

Each woreda deployment needs:

```env
# Woreda Identity
NEXT_PUBLIC_WOREDA_ID=woreda-9
NEXT_PUBLIC_WOREDA_NAME=Woreda 9 Administration
NEXT_PUBLIC_WOREDA_LOGO_PATH=/assets/branding/logo-woreda9.svg

# Supabase (Option 1: Separate projects)
NEXT_PUBLIC_SUPABASE_URL=https://woreda9-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_URL=https://woreda9-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...

# R2 Storage (can be shared bucket with folder separation)
CLOUDFLARE_R2_UPLOAD_URL=https://account.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://account.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET_NAME=woreda-documents
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
```

## Summary

- **Files**: ✅ Separated by woreda_id
- **QR Codes**: ✅ Separated by woreda_id (after fix)
- **Admin Logins**: ⚠️ Currently shared (needs separate Supabase projects for true separation)

