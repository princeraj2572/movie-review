#!/usr/bin/env node

/**
 * Authentication Verification Script
 * Run this to check if your Supabase authentication is properly configured
 * 
 * Usage: node verify-auth.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Cinescope Authentication Verification\n');
console.log('=' .repeat(50));

// 1. Check .env.local exists
console.log('\n✓ Step 1: Checking .env.local file...');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file found');
  const env = require('dotenv').config({ path: envPath });
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_TMDB_API_KEY'
  ];
  
  const missing = [];
  const present = [];
  
  requiredVars.forEach(v => {
    if (process.env[v]) {
      present.push(v);
      console.log(`   ✅ ${v}`);
    } else {
      missing.push(v);
      console.log(`   ❌ ${v} - MISSING`);
    }
  });
  
  if (missing.length > 0) {
    console.log('\n⚠️  Missing environment variables:');
    missing.forEach(v => console.log(`   - ${v}`));
    console.log('\nAdd these to your .env.local file!');
  }
} else {
  console.log('❌ .env.local file NOT found');
  console.log('   Create it in project root with Supabase credentials');
}

// 2. Check package.json has required dependencies
console.log('\n✓ Step 2: Checking dependencies...');
const packagePath = path.join(__dirname, 'package.json');
const package = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

const requiredDeps = [
  '@supabase/supabase-js',
  'next',
  'react'
];

requiredDeps.forEach(dep => {
  if (package.dependencies[dep]) {
    console.log(`   ✅ ${dep} - ${package.dependencies[dep]}`);
  } else {
    console.log(`   ❌ ${dep} - NOT FOUND`);
  }
});

// 3. Check key files exist
console.log('\n✓ Step 3: Checking authentication files...');
const authFiles = [
  'lib/auth.ts',
  'lib/supabase.ts',
  'components/auth/AuthProvider.tsx',
  'components/auth/AuthModal.tsx',
  'app/api/auth/profile/route.ts'
];

authFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - NOT FOUND`);
  }
});

// 4. Summary
console.log('\n' + '='.repeat(50));
console.log('\n📋 Next Steps:\n');
console.log('1. Make sure all environment variables are filled in .env.local');
console.log('2. In your Supabase dashboard, create the database tables (see AUTHENTICATION_SETUP.md)');
console.log('3. Enable Email Authentication in Supabase Settings');
console.log('4. Run: npm run dev');
console.log('5. Test sign up at http://localhost:3000\n');

console.log('📖 For detailed instructions, see AUTHENTICATION_SETUP.md');
console.log('🆘 For troubleshooting, see AUTHENTICATION_TROUBLESHOOTING.md\n');
