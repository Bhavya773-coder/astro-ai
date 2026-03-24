// Test script for streaming chat functionality
// Note: This requires Node.js 18+ for built-in fetch

async function testStreamingChat() {
  try {
    console.log('🧪 Testing streaming chat endpoint...');
    
    const response = await fetch('http://localhost:5001/api/gpt/chat-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // You'll need to replace this
      },
      body: JSON.stringify({ 
        message: 'Tell me about my love life this month', 
        model: 'gpt-oss:120B' 
      })
    });

    if (!response.ok) {
      console.error('❌ Request failed:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response body:', text);
      return;
    }

    console.log('✅ Streaming started!');
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('\n🏁 Stream completed');
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ') && line.trim() !== 'data: ') {
          try {
            const jsonStr = line.slice(6);
            const data = JSON.parse(jsonStr);
            
            if (data.type === 'token') {
              process.stdout.write(data.token);
            } else if (data.type === 'complete') {
              console.log('\n✅ Complete message received');
              console.log('Message ID:', data.messageId);
              console.log('Content length:', data.content.length);
            } else if (data.type === 'error') {
              console.error('\n❌ Error:', data.error);
            }
          } catch (parseError) {
            console.error('Parse error:', parseError.message);
          }
        }
      }
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

console.log('📝 To test this properly:');
console.log('1. Get a valid JWT token from your app');
console.log('2. Replace YOUR_TOKEN_HERE in the script');
console.log('3. Run: node test-streaming-chat.js');
console.log('');
console.log('Or just test through the web app at http://localhost:3000');
console.log('');
console.log('🔍 Quick test - just check if endpoint exists:');
console.log('Run this in browser: http://localhost:5001/api/gpt/chat-stream');

testStreamingChat();
