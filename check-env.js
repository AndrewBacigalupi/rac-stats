// Simple script to check if environment variables are set correctly
require('dotenv').config({ path: '.env.local' });

console.log('=== Environment Variables Check ===');
console.log('');

const spreadsheetId = process.env.SPREADSHEET_ID;
const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;

console.log('1. SPREADSHEET_ID:');
if (spreadsheetId) {
  console.log('   ✅ Found');
  console.log('   Value:', spreadsheetId.substring(0, 20) + '...');
} else {
  console.log('   ❌ NOT SET');
}

console.log('');
console.log('2. GOOGLE_SERVICE_ACCOUNT_CREDENTIALS:');
if (credentials) {
  console.log('   ✅ Found');
  console.log('   Length:', credentials.length, 'characters');
  
  try {
    const parsed = JSON.parse(credentials);
    console.log('   ✅ Valid JSON');
    console.log('   Project ID:', parsed.project_id);
    console.log('   Client Email:', parsed.client_email);
  } catch (error) {
    console.log('   ❌ Invalid JSON:', error.message);
  }
} else {
  console.log('   ❌ NOT SET');
}

console.log('');
console.log('=== Next Steps ===');
if (!spreadsheetId || !credentials) {
  console.log('❌ Missing environment variables. Please:');
  console.log('1. Create a .env.local file in your project root');
  console.log('2. Add your SPREADSHEET_ID and GOOGLE_SERVICE_ACCOUNT_CREDENTIALS');
  console.log('3. Restart your development server');
} else {
  console.log('✅ Environment variables look good!');
  console.log('Try clicking the "Test Google Sheets Connection" button.');
}

