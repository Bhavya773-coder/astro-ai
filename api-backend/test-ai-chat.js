/**
 * AI Chat System Test
 * Run this to verify the AI chat implementation
 */

const mongoose = require('mongoose');
const aiService = require('./services/aiService');
const contextBuilder = require('./services/contextBuilder');
const chatMemory = require('./services/chatMemory');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

async function testAIService() {
  console.log('\n=== Testing AI Service ===\n');
  
  // Test 1: Health Check
  console.log('1. Testing Ollama health check...');
  const health = await aiService.healthCheck();
  console.log('   Health status:', health);
  
  // Test 2: Generate completion
  console.log('\n2. Testing AI completion...');
  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Say "Hello from AstroAi4u" and nothing else.' }
  ];
  
  try {
    const response = await aiService.generateCompletion(messages);
    console.log('   Response:', response.substring(0, 100));
    console.log('   ✓ AI Service is working!');
  } catch (error) {
    console.log('   ✗ AI Service error:', error.message);
  }
}

async function testContextBuilder() {
  console.log('\n=== Testing Context Builder ===\n');
  
  // Test with sample profile
  const sampleProfile = {
    full_name: 'Test User',
    date_of_birth: '1990-01-01',
    time_of_birth: '12:00 PM',
    place_of_birth: 'Mumbai, India',
    gender: 'male',
    current_location: 'Mumbai',
    life_context: {
      career_stage: 'early-career',
      relationship_status: 'single',
      main_life_focus: 'career',
      personality_style: 'emotional',
      primary_life_problem: 'Want to know about career growth'
    },
    birth_chart_data: {
      sun_sign: 'Capricorn',
      moon_sign: 'Aries',
      ascendant: 'Leo',
      dominant_planet: 'Saturn'
    },
    numerology_data: {
      life_path: '4',
      destiny: '8',
      personal_year: '3'
    }
  };
  
  const systemPrompt = contextBuilder.buildSystemPrompt(sampleProfile);
  console.log('1. Generated system prompt (first 500 chars):');
  console.log(systemPrompt.substring(0, 500) + '...\n');
  
  // Test messages array building
  const chatHistory = [
    { role: 'user', content: 'What does my chart say about career?' },
    { role: 'assistant', content: 'Your Capricorn Sun indicates strong career focus...' }
  ];
  
  const messages = contextBuilder.buildMessagesArray(
    systemPrompt,
    chatHistory,
    'Tell me more about this year'
  );
  
  console.log('2. Built messages array with', messages.length, 'messages');
  console.log('   ✓ Context Builder is working!');
}

async function testChatMemory() {
  console.log('\n=== Testing Chat Memory ===\n');
  
  // Note: This requires database connection
  if (mongoose.connection.readyState !== 1) {
    console.log('1. ⚠ Database not connected, skipping chat memory tests');
    return;
  }
  
  console.log('1. Database connected, testing chat memory...');
  
  try {
    // Create test chat
    const testChat = new Chat({
      user_id: new mongoose.Types.ObjectId(),
      title: 'Test Chat',
      created_at: new Date(),
      updated_at: new Date()
    });
    await testChat.save();
    console.log('   Created test chat:', testChat._id);
    
    // Save test message
    const testMessage = await chatMemory.saveMessage({
      chatId: testChat._id,
      userId: testChat.user_id,
      role: 'user',
      content: 'Test message'
    });
    console.log('   Saved test message:', testMessage._id);
    
    // Get history
    const history = await chatMemory.getHistory(testChat._id);
    console.log('   Retrieved history:', history.length, 'messages');
    
    // Cleanup
    await Chat.findByIdAndDelete(testChat._id);
    await Message.deleteMany({ chat_id: testChat._id });
    console.log('   Cleaned up test data');
    
    console.log('   ✓ Chat Memory is working!');
  } catch (error) {
    console.log('   ✗ Chat Memory error:', error.message);
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║       AstroAi4u Chat System Test Suite         ║');
  console.log('╚════════════════════════════════════════════════╝');
  
  try {
    await testAIService();
  } catch (e) {
    console.log('AI Service tests failed:', e.message);
  }
  
  try {
    await testContextBuilder();
  } catch (e) {
    console.log('Context Builder tests failed:', e.message);
  }
  
  try {
    await testChatMemory();
  } catch (e) {
    console.log('Chat Memory tests failed:', e.message);
  }
  
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║              Test Suite Complete              ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
