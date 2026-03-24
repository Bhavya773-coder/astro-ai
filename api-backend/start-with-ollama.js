#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting AstroAI Backend with Ollama...');

// Function to check if Ollama is running
function checkOllama() {
  return new Promise((resolve) => {
    const ollamaCheck = spawn('ollama', ['list'], { 
      stdio: 'pipe',
      shell: true 
    });

    ollamaCheck.on('close', (code) => {
      resolve(code === 0);
    });

    ollamaCheck.on('error', () => {
      resolve(false);
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      resolve(false);
    }, 5000);
  });
}

// Function to start Ollama
function startOllama() {
  console.log('🔮 Starting Ollama server...');
  
  const ollamaProcess = spawn('ollama', ['serve'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    detached: true
  });

  ollamaProcess.stdout.on('data', (data) => {
    console.log('[Ollama]', data.toString());
  });

  ollamaProcess.stderr.on('data', (data) => {
    console.log('[Ollama Error]', data.toString());
  });

  ollamaProcess.on('error', (error) => {
    console.error('❌ Failed to start Ollama:', error.message);
  });

  ollamaProcess.on('close', (code) => {
    console.log('📴 Ollama process closed with code:', code);
  });

  // Give Ollama time to start
  setTimeout(() => {
    console.log('✅ Ollama should be ready now!');
  }, 10000); // 10 seconds

  return ollamaProcess;
}

// Function to start the backend
function startBackend() {
  console.log('🌟 Starting AstroAI Backend...');
  
  const backendProcess = spawn('node', ['server.js'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  backendProcess.on('error', (error) => {
    console.error('❌ Failed to start backend:', error.message);
  });

  backendProcess.on('close', (code) => {
    console.log('📴 Backend process closed with code:', code);
  });

  return backendProcess;
}

// Main startup sequence
async function main() {
  try {
    console.log('🔍 Checking if Ollama is running...');
    const ollamaRunning = await checkOllama();
    
    if (!ollamaRunning) {
      console.log('📦 Ollama not running, starting it...');
      startOllama();
      
      // Wait a bit for Ollama to initialize
      console.log('⏳ Waiting 15 seconds for Ollama to fully start...');
      await new Promise(resolve => setTimeout(resolve, 15000));
    } else {
      console.log('✅ Ollama is already running!');
    }

    // Start the backend
    startBackend();

    console.log('🎉 AstroAI Backend is starting up!');
    console.log('📱 Frontend should be available at: http://localhost:3000');
    console.log('🔌 Backend API available at: http://localhost:5001');
    console.log('🔮 Ollama API available at: http://localhost:11434');

  } catch (error) {
    console.error('💥 Startup failed:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  process.exit(0);
});

main();
