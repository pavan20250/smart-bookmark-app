# Step-by-step: Connect Google OAuth to Supabase

## Part 1: Google Cloud Console

### 1. Create or select a project

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Use the project dropdown at the top. Create a **New Project** (e.g. "Smart Bookmark") or pick an existing one.

### 2. Configure OAuth consent screen

1. In the left menu: **APIs & Services** → **OAuth consent screen**.
2. Choose **External** (unless you use a Google Workspace org) → **Create**.
3. Fill in:
   - **App name**: e.g. "Smart Bookmark"
   - **User support email**: your email
   - **Developer contact**: your email
4. Click **Save and Continue**.
5. **Scopes**: leave default, **Save and Continue**.
6. **Test users** (if app is in Testing): add your Google account so you can sign in. **Save and Continue**.
7. **Summary** → **Back to Dashboard**.

### 3. Create OAuth client credentials

1. Left menu: **APIs & Services** → **Credentials**.
2. Click **+ Create Credentials** → **OAuth client ID**.
3. **Application type**: **Web application**.
4. **Name**: e.g. "Smart Bookmark Web".
5. **Authorized redirect URIs** → **+ Add URI** and add:
   ```text
   https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
   ```
   Replace `<YOUR_SUPABASE_PROJECT_REF>` with your Supabase project reference ID (see Part 2, step 1).
6. Click **Create**.
7. Copy the **Client ID** and **Client Secret** (you’ll need them in Supabase). You can open the client again from **Credentials** if you lose them.

---

## Part 2: Supabase Dashboard

### 1. Get your project reference ID

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. **Project Settings** (gear icon in the left sidebar) → **General**.
3. Copy **Reference ID** (e.g. `abcdefghijklmnop`).  
   Your redirect URI is: `https://<REF>.supabase.co/auth/v1/callback`.  
   Use this exact URL in Google (Part 1, step 3).

### 2. Enable Google provider

1. In the left sidebar: **Authentication** → **Providers**.
2. Find **Google** in the list.
3. Turn **Enable Sign in with Google** **ON**.
4. Paste:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)
5. Click **Save**.

### 3. Set redirect URLs (optional but recommended)

1. **Authentication** → **URL Configuration**.
2. **Site URL**: set to your app URL, e.g.  
   - Local: `http://localhost:3000`  
   - Production: `https://your-app.vercel.app`
3. **Redirect URLs**: add the URLs Supabase may redirect to after login:
   - `http://localhost:3000/auth/callback`
   - `https://your-app.vercel.app/auth/callback` (when deployed)
4. **Save**.

---

## Part 3: Verify

1. In your app, open the login page and click **Continue with Google**.
2. You should be sent to Google’s sign-in, then back to your app and logged in.

**If you see “provider is not enabled”:**  
- Confirm you’re in the correct Supabase project (same as in `.env.local`).  
- In **Authentication** → **Providers**, ensure Google is **ON** and Client ID/Secret are saved.  
- Try turning Google **off**, Save, then **on** again and Save.

**If Google says “redirect_uri_mismatch”:**  
- The redirect URI in Google Cloud must be exactly:  
  `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`  
  (no trailing slash, correct project ref).  
- Wait a minute after changing and try again.
