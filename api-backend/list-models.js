const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  console.log('Listing available models...\n');
  
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`,
      { timeout: 10000 }
    );
    
    console.log('✅ SUCCESS! Available models:\n');
    response.data.models.forEach(model => {
      console.log(`- ${model.name}`);
      console.log(`  Supported methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('');
    });
  } catch (err) {
    console.log('❌ FAILED!');
    console.log('Status:', err.response?.status);
    console.log('Error:', err.response?.data?.error?.message || err.message);
  }
}

listModels();
