const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
console.log('Testing Gemini API...');
console.log('Key format check:', API_KEY ? `Length: ${API_KEY.length}, Starts with: ${API_KEY.substring(0, 10)}...` : 'MISSING');

// Test different model endpoints
const models = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
  'gemini-pro-vision'
];

async function testModel(model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
  console.log(`\n--- Testing ${model} ---`);
  console.log('URL:', url.replace(API_KEY, 'API_KEY_HIDDEN'));
  
  try {
    const response = await axios.post(url, {
      contents: [{
        parts: [{ text: 'Say hello in one word' }]
      }]
    }, { timeout: 10000 });
    
    console.log('✅ SUCCESS! Status:', response.status);
    console.log('Response:', response.data?.candidates?.[0]?.content?.parts?.[0]?.text);
    return true;
  } catch (err) {
    console.log('❌ FAILED! Status:', err.response?.status);
    console.log('Error:', err.response?.data?.error?.message || err.message);
    return false;
  }
}

async function main() {
  for (const model of models) {
    await testModel(model);
  }
}

main().then(() => {
  console.log('\n--- Test Complete ---');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
