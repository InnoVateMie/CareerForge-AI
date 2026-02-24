# 🚀 Step-by-Step Netlify Deployment Guide

This guide will take you from your local code to a live, working website. Follow these steps exactly.

## Phase 1: Uploading your code to GitHub 💻
If your code is not already on GitHub, do this first:
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

## Phase 3: Setting the "Secret" Keys 🔑
This is the most important step. Without these, AI and Database will not work.
1. In the Netlify setup screen, look for the **"Environment Variables"** section (or click **Site Settings > Environment Variables** after deployment).
2. Click **"Add a variable"** and add these 6 keys one by one:

| Key Name | Where to find it? |
| :--- | :--- |
| **`DATABASE_URL`** | Supabase > Settings > Database > Connection String (URI). *Use the one with your password!* |
| **`VITE_SUPABASE_URL`** | Supabase > Settings > API > Project URL. |
| **`VITE_SUPABASE_ANON_KEY`** | Supabase > Settings > API > `anon` `public` key. |
| **`SUPABASE_SERVICE_ROLE_KEY`** | Supabase > Settings > API > `service_role` `secret` key. **(DO NOT share this!)** |
| **`AI_INTEGRATIONS_OPENAI_API_KEY`** | [OpenAI Dashboard](https://platform.openai.com/api-keys) > Create new secret key. |
| **`AI_INTEGRATIONS_OPENAI_BASE_URL`** | Set this to: `https://api.openai.com/v1` |

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
   - Look for red error messages. Usually, it's a missing or expired OpenAI key.
3. **If Auth fails**:
   - Go to Supabase Dashboard > Authentication > URL Configuration.
   - Ensure the **Site URL** is updated to your new Netlify link (e.g., `https://careerforge-ai.netlify.app`).
