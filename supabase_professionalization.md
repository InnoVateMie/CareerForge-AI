# Supabase Professionalization Guide 💎

To make your project look like a real production app, you need to customize the Supabase Auth settings.

## 1. Remove "Powered by Supabase" Emails 📧
By default, Supabase uses a built-in mailer. To remove the "Powered by" footer:
1. Go to your **Supabase Dashboard**.
2. Go to **Authentication > Providers > Email**.
3. Enable **"Confirm Email"**.
4. Scroll down to **"Smtp Settings"**.
5. You **MUST** use a custom SMTP provider (like Resend, SendGrid, or Mailgun) to remove the default branding and increase delivery limits.

## 2. Customize Email Templates ✍️
1. Go to **Authentication > Email Templates**.
2. You can edit the **Confirm Signup**, **Reset Password**, and **Invite User** templates.
3. Use your own HTML/CSS to brand the emails with your logo and colors.

## 3. Custom Domain 🌐
1. To change the URL in the email from `yomzvw...supabase.co` to your own domain:
2. Go to **Settings > Custom Domains**.
3. Follow the instructions to link your project to your own domain (requires Pro plan).

## 4. Redirect URLs 🔗
1. Go to **Authentication > URL Configuration**.
2. Set the **Site URL** to your Netlify URL (e.g., `https://your-site.netlify.app`).
3. Add `https://your-site.netlify.app/**` to the **Redirect URLs** list.
