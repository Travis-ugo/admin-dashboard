
const admin = require('firebase-admin');
const { validateAdmin } = require('../src/lib/auth-middleware');

// Mock a Request object
class MockRequest {
  constructor(headers) {
    this.headers = new Map(Object.entries(headers));
  }
}

async function testSecurity() {
  console.log('--- Testing Security Logic ---');

  // Test 1: Missing Header
  try {
    console.log('Test 1: Missing Authorization Header...');
    const req = new MockRequest({});
    await validateAdmin(req);
    console.error('❌ Failed: Should have thrown for missing header');
  } catch (e) {
    console.log('✅ Success:', e.message);
  }

  // Test 2: Invalid Token Format
  try {
    console.log('\nTest 2: Invalid Token Format (not Bearer)...');
    const req = new MockRequest({ 'Authorization': 'Basic 123' });
    await validateAdmin(req);
    console.error('❌ Failed: Should have thrown for invalid format');
  } catch (e) {
    console.log('✅ Success:', e.message);
  }

  // Test 3: Expired/Invalid Token
  try {
    console.log('\nTest 3: Expired/Invalid Token...');
    const req = new MockRequest({ 'Authorization': 'Bearer invalid_token' });
    await validateAdmin(req);
    console.error('❌ Failed: Should have thrown for invalid token');
  } catch (e) {
    console.log('✅ Success:', e.message);
  }

  console.log('\n--- Code Audit ---');
  console.log('Checking AuthContext.tsx for fallbacks...');
  // I'll use grep to ensure no "admin@zander.com" remains
}

testSecurity();
