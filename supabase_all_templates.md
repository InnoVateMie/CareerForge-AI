# Professional Supabase Email Templates ✉️

Copy and paste these templates into your **Supabase Dashboard** under **Authentication > Email Templates**.

---

## 1. Confirm Signup
**Location**: `Confirm Signup` tab

### Subject
`Welcome to CareerForge AI - Confirm Your Identity`

### Body (HTML)
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .button { background-color: #6366f1; border: none; color: white; padding: 12px 24px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 8px; font-weight: bold; }
    .container { font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <h2 style="color: #6366f1;">Welcome to CareerForge AI!</h2>
    <p>Success starts with a single step. You're one click away from unlocking your cinematic career workspace.</p>
    <p>Please confirm your email address to get started:</p>
    <a href="{{ .ConfirmationURL }}" class="button">Confirm My Account</a>
    <p style="margin-top: 20px; font-size: 14px; color: #64748b;">If you didn't sign up for CareerForge AI, you can safely ignore this email.</p>
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 12px; color: #94a3b8;">© 2026 CareerForge AI. Forge your dream career with intelligent precision.</p>
  </div>
</body>
</html>
```

---

## 2. Reset Password
**Location**: `Reset Password` tab

### Subject
`Reset Your CareerForge AI Password`

### Body (HTML)
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .button { background-color: #6366f1; border: none; color: white; padding: 12px 24px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 8px; font-weight: bold; }
    .container { font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <h2 style="color: #6366f1;">Reset Your Password</h2>
    <p>We received a request to reset the password for your CareerForge AI account.</p>
    <p>Click the button below to choose a new password:</p>
    <a href="{{ .ConfirmationURL }}" class="button">Reset My Password</a>
    <p style="margin-top: 20px; font-size: 14px; color: #64748b;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 12px; color: #94a3b8;">© 2026 CareerForge AI. Forge your dream career with intelligent precision.</p>
  </div>
</body>
</html>
```

---

## 3. Invite User
**Location**: `Invite User` tab

### Subject
`You've been invited to CareerForge AI`

### Body (HTML)
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .button { background-color: #6366f1; border: none; color: white; padding: 12px 24px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 8px; font-weight: bold; }
    .container { font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <h2 style="color: #6366f1;">You're Invited!</h2>
    <p>You have been invited to join CareerForge AI, the premier cinematic career workplace.</p>
    <p>Click the button below to accept your invitation and create your account:</p>
    <a href="{{ .ConfirmationURL }}" class="button">Accept Invitation</a>
    <p style="margin-top: 20px; font-size: 14px; color: #64748b;">This invitation link will expire soon. We look forward to seeing you inside!</p>
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 12px; color: #94a3b8;">© 2026 CareerForge AI. Forge your dream career with intelligent precision.</p>
  </div>
</body>
</html>
```
