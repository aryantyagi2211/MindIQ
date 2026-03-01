// Quick verification script
// Run with: node verify-setup.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying AI Paper Assessment Setup...\n');

// Check .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('GROQ_API_KEY')) {
    if (envContent.includes('gsk_your_actual_groq_api_key_here') || 
        envContent.includes('your_groq_api_key_here')) {
      console.log('❌ GROQ_API_KEY is still a placeholder!');
      console.log('   Please replace it with your real key from https://console.groq.com/keys\n');
    } else if (envContent.match(/GROQ_API_KEY=gsk_[a-zA-Z0-9_]+/)) {
      console.log('✅ GROQ_API_KEY is set!\n');
    } else {
      console.log('⚠️  GROQ_API_KEY format looks unusual. Make sure it starts with "gsk_"\n');
    }
  } else {
    console.log('❌ GROQ_API_KEY not found in .env file!\n');
  }
} else {
  console.log('❌ .env file not found!\n');
}

// Check edge function files
const files = [
  'supabase/functions/generate-questions/index.ts',
  'supabase/functions/score-answers/index.ts',
  'src/pages/TestSetup.tsx',
  'src/pages/TestTake.tsx',
  'src/pages/TestResult.tsx'
];

console.log('📁 Checking required files:');
files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING!`);
  }
});

console.log('\n📋 Next Steps:');
console.log('1. If GROQ_API_KEY is placeholder, add your real key to .env');
console.log('2. Run: npm run dev');
console.log('3. Open: http://localhost:5173/test/setup');
console.log('4. Test the AI Paper Assessment!\n');

console.log('💡 If you see errors, check TROUBLESHOOT.md for solutions.\n');
