# Email Configuration Guide for Cinescope

## Problem
Supabase is blocking signups with "Error sending confirmation email" because email verification is enabled but not configured.

## Solution: Two Options

### **OPTION 1: Disable Email Verification (Recommended for Development)**

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication > Providers > Email**
3. Under **Email Provider**, you'll see settings
4. **Disable** "Confirm email" checkbox
5. Save changes

**After this, users can sign up and sign in immediately without email confirmation.**

---

### **OPTION 2: Configure Email with Supabase (For Production)**

#### Step 1: Enable Custom SMTP

1. In Supabase Dashboard, go to **Project Settings > Email Templates**
2. Click **"Use custom SMTP"**
3. You'll need email credentials from one of:
   - **Gmail** (App Password required)
   - **SendGrid**
   - **Mailgun**
   - **Any other SMTP provider**

#### Step 2: Example - Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an **App Password** at https://myaccount.google.com/apppasswords
3. In Supabase Email Settings, fill in:
   - **SMTP Host**: `smtp.gmail.com`
   - **SMTP Port**: `587`
   - **SMTP User**: your.email@gmail.com
   - **SMTP Password**: (Your app password from step 2)
   - **From Email**: verification@yourdomain.com (or your gmail)
4. Click **"Send Test Email"** to verify it works

#### Step 3: Configure Email Templates

1. Go to **Authentication > Email Templates** in Supabase
2. Configure:
   - **Confirmation Email** - This is sent when user signs up
   - **Reset Email** - For password resets
   - **Change Email** - When users change their email

3. Make sure the links point to: `{{ .ConfirmationURL }}`

---

## Current Status

✅ **The app is configured to work WITHOUT email verification for now.**

Users can:
- Sign up with any email
- Sign in immediately (no email confirmation needed)
- Use all features normally

---

## Reverting to Email Verification Later

When you're ready to enable email verification:

1. Configure SMTP via Option 2 above
2. In Supabase > Authentication > Providers > Email
3. Enable "Confirm email"
4. Users will need to verify email before using the app

---

## Troubleshooting

**Q: Users still can't sign up**
- Make sure you disabled "Confirm email" in Supabase settings
- Clear browser cache and try again

**Q: Emails not arriving**
- Check SMTP credentials are correct
- Check sender email address is valid
- Check spam folder

**Q: Can't find Email settings in Supabase**
- You might be on a free tier with limitations
- Upgrade to Pro tier: https://supabase.com/dashboard/account/billing

---

## Testing

Test signup at: `http://localhost:3001/` → Click "Sign Up" → Create account

Should work immediately after signup!
