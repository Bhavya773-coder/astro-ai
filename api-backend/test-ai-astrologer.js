const http = require('http');

// Test configuration
const BASE_URL = 'localhost:5001';
const TEST_USER = {
  email: 'mashrubhavya5@gmail.com',
  password: 'test123'
};

let authToken = '';
let chatId = '';

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL.split(':')[0],
      port: BASE_URL.split(':')[1],
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testPersonalAIastrologer() {
  console.log('🔮 Testing Personal AI Astrologer Feature...\n');

  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await makeRequest('/api/auth/login', 'POST', TEST_USER);
    if (loginResponse.status !== 200) {
      throw new Error(`Login failed: ${loginResponse.data.message}`);
    }
    authToken = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Create a new chat
    console.log('\n2. Creating new chat...');
    const createChatResponse = await makeRequest(
      '/api/ai-chat/create',
      'POST',
      { title: 'Astrology Guidance Session' },
      { Authorization: `Bearer ${authToken}` }
    );
    if (createChatResponse.status !== 201) {
      throw new Error(`Chat creation failed: ${createChatResponse.data.message}`);
    }
    chatId = createChatResponse.data.data._id;
    console.log('✅ Chat created:', chatId);

    // Step 3: Send a message to the AI astrologer
    console.log('\n3. Sending message to AI astrologer...');
    const messageResponse = await makeRequest(
      '/api/ai-chat/send',
      'POST',
      {
        chatId: chatId,
        message: "Hello! I'd like guidance about my career path based on my birth chart. What do you see for my professional future?"
      },
      { Authorization: `Bearer ${authToken}` }
    );
    
    if (messageResponse.status !== 200) {
      throw new Error(`Message sending failed: ${messageResponse.data.message}`);
    }
    console.log('✅ Message sent successfully');
    console.log('AI Response:', messageResponse.data.data.aiMessage.content.substring(0, 200) + '...');

    // Step 4: Get chat history
    console.log('\n4. Getting chat history...');
    const historyResponse = await makeRequest(
      `/api/ai-chat/${chatId}/messages`,
      'GET',
      null,
      { Authorization: `Bearer ${authToken}` }
    );
    
    if (historyResponse.status !== 200) {
      throw new Error(`History retrieval failed: ${historyResponse.data.message}`);
    }
    console.log('✅ Chat history retrieved');
    console.log('Total messages:', historyResponse.data.data.length);

    console.log('\n🎉 Personal AI Astrologer Feature Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ User authentication');
    console.log('- ✅ Chat creation');
    console.log('- ✅ Message sending and AI response');
    console.log('- ✅ Chat history retrieval');
    console.log('- 🎯 Ready for personal astrology guidance!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n💡 Hint: Check user credentials or token');
    } else if (error.message.includes('503')) {
      console.log('\n💡 Hint: AI service (Ollama) may not be running');
    } else if (error.message.includes('500')) {
      console.log('\n💡 Hint: Server error - check logs');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Hint: Server may not be running on port 5001');
    }
  }
}

// Run the test
if (require.main === module) {
  testPersonalAIastrologer();
}

module.exports = { testPersonalAIastrologer };
