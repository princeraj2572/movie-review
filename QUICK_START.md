# 🚀 QUICK CONNECTION (5 MINUTE SETUP)

## Copy-Paste These Commands

### Terminal 1: Setup Database
```
1. Open: https://app.supabase.com
2. Select your CineScope project
3. Click "SQL Editor"
4. Click "New Query"
5. Open file: supabase-setup.sql
6. Copy ALL code
7. Paste in SQL Editor
8. Click "Run"
9. Wait for 30 seconds ⏳
10. All statements turn GREEN ✅
```

### Terminal 2: Start App
```bash
npm run dev
```

### Browser: Test Signup
```
1. Go to http://localhost:3000
2. Click "Join Free"
3. Enter:
   Email: test@example.com
   Password: Test123!@
   Username: testuser
   Name: Test User
4. Click "Create Account"
5. See: "Account created successfully!" ✅
```

### Browser: Test Signin
```
1. Click "Sign In" tab
2. Enter same email/password
3. Click "Sign In"
4. Modal closes → LOGGED IN ✅
```

---

## ✅ VERIFICATION (Should See This)

✅ `npm run build` - **No errors**  
✅ `npm run dev` - Starts server  
✅ http://localhost:3000 - Page loads  
✅ Signup works - Profile created  
✅ Signin works - User loads  

---

## 🐛 If It Fails

**"relation 'profiles' does not exist"**
→ Restart: Run supabase-setup.sql again

**"Email provider not enabled"**  
→ Supabase Dashboard → Authentication → Providers → Email → Toggle ON

**"Port 3000 in use"**
→ `npm run dev -- -p 3001`

**Build errors**
→ All fixed! Just run `npm run build`

---

## 📖 Need Details?

- 📋 See: `COMPLETE_FIX_CHECKLIST.md` (verbose)
- 📖 See: `SETUP_AUTH.md` (troubleshooting)
- 🗄️ See: `DATABASE_VERIFICATION.sql` (debug)
