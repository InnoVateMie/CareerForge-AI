# 🚀 Step-by-Step Netlify Deployment Guide

This guide will take you from your local code to a live, working website. Follow these steps exactly.

## Phase 1: Uploading your code to GitHub 💻
> [!WARNING]
> **NEVER commit your `.env` files.** I have already updated your `.gitignore` to prevent this. Git will now automatically skip these files during uploads to keep your passwords safe.

If your code is not already on GitHub, do this first:
...
1. Go to [GitHub.com](https://github.com) and create a **New Repository**. Name it `CareerForge-AI`.
2. Open your terminal in VS Code and run these commands:
   ```bash
   git init
   git add .
   git commit -m "initial production commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/CareerForge-AI.git
   git push -u origin main
   ```
   *(Replace YOUR_USERNAME with your actual GitHub username)*

---

## Phase 2: Connecting to Netlify ☁️
1. Go to [Netlify.com](https://netlify.com) and log in.
2. Click the blue **"Add new site"** button.
3. Select **"Import from Git"**.
4. Click **"GitHub"** and authorize it.
5. Search for your `CareerForge-AI` repository and click it.

---

| Key Name | Value (Copy exactly) | 
| :--- | :--- |
| **`DATABASE_URL`** | `postgresql://postgres:[PASSWORD]@db.yomzvwcckrfgpnbwokng.supabase.co:5432/postgres` |
| **`VITE_SUPABASE_URL`** | `https://yomzvwcckrfgpnbwokng.supabase.co` |
| **`VITE_SUPABASE_ANON_KEY`** | `[Your Supabase Anon Key]` |
| **`SUPABASE_SERVICE_ROLE_KEY`** | `[Your Supabase Service Role Key]` |
| **`GOOGLE_GEMINI_API_KEY`** | `[Your Google Gemini API Key]` |

> [!IMPORTANT]
> For `DATABASE_URL`, ensure there are no brackets around your password. I have removed them in the table above for you.

---

## 🔑 How to get your FREE Gemini API Key
See the full guide here: **[gemini_setup.md](file:///c:/Users/HP/AI-Business-Proposal/gemini_setup.md)**

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **"Create API key"**.
3. Copy the key and paste it into the **`GOOGLE_GEMINI_API_KEY`** variable in Netlify.

---

## Phase 4: Finalizing Build Settings 🏗️
Ensure these fields are filled correctly on the Netlify deploy page:
- **Build Command**: `npm run build`
- **Publish Directory**: `dist/public`
- **Base Directory**: (Leave blank)

Finally, click the big **"Deploy CareerForge-AI"** button!

---

## Phase 5: Testing & Troubleshooting 🛠️
1. Once Netlify says "Published", click the **Site URL** (at the top) to view your site.
2. **If "Generate" fails**:
   - Go to Netlify Dashboard > **Logs** > **Functions**.
   - Click on the `api` function. 
   - Look for red error messages. Usually, it's a missing or invalid `GOOGLE_GEMINI_API_KEY`.
3. **If Auth fails**:
   - Go to Supabase Dashboard > Authentication > URL Configuration.
   - Ensure the **Site URL** is updated to your new Netlify link (e.g., `https://careerforge-ai.netlify.app`).
