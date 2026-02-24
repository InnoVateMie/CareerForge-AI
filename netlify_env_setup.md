# ☁️ How to set up your Netlify Environment Variables

Since we masked the keys in the public guide for security, you need to manually copy them from your local project into the Netlify dashboard. Follow these steps exactly:

## Step 1: Open your Netlify Dashboard
1. Go to [app.netlify.com](https://app.netlify.com/).
2. Click on your site: **`CareerForge-AI`**.
3. In the left sidebar, click **"Site Settings"** (at the bottom).
4. Click **"Environment variables"**.

## Step 2: Add the 5 "Secret" Keys
Click the **"Add a variable"** button (select **"Add a single variable"**) for each of these 5 items. 

> [!TIP]
> **Where to find these values?** Open the [`.env`](file:///c:/Users/HP/AI-Business-Proposal/.env) file in VS Code on your computer.

| Key Name | Value (Copy from your `.env` file) |
| :--- | :--- |
| **`GOOGLE_GEMINI_API_KEY`** | Copy from `GOOGLE_GEMINI_API_KEY` in [`.env`](file:///c:/Users/HP/AI-Business-Proposal/.env) |
| **`DATABASE_URL`** | Copy from `DATABASE_URL` in [`.env`](file:///c:/Users/HP/AI-Business-Proposal/.env) |
| **`SUPABASE_SERVICE_ROLE_KEY`** | Copy from `SUPABASE_SERVICE_ROLE_KEY` in [`.env`](file:///c:/Users/HP/AI-Business-Proposal/.env) |
| **`VITE_SUPABASE_URL`** | Copy from `VITE_SUPABASE_URL` in [`.env`](file:///c:/Users/HP/AI-Business-Proposal/.env) |
| **`VITE_SUPABASE_ANON_KEY`** | Copy from `VITE_SUPABASE_ANON_KEY` in [`.env`](file:///c:/Users/HP/AI-Business-Proposal/.env) |

## Step 3: Trigger a New Deploy
After adding all 5 variables:
1. Go to the **"Deploys"** tab in the top menu.
2. Click the **"Trigger deploy"** dropdown.
3. Select **"Clear cache and deploy site"**.

---

### ⚠️ Troubleshooting
- **Build fails at "Installing dependencies"**: Check your Netlify UI settings and ensure **Base directory** is empty and **Build command** is exactly `npm run build`.
- **"Generate" fails on the live site**: Check the `api` function logs in Netlify and ensure your Gemini key is correct.
