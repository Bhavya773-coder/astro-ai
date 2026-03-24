const axios = require('axios');

/**
 * AI Service - Robust Ollama Integration
 * Handles communication with the local gpt-oss:120B model via Ollama
 */
class AIService {
  constructor() {
    this.baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'gpt-oss:120B';
    this.timeout = parseInt(process.env.OLLAMA_TIMEOUT) || 300000; // 5 minutes default
    this.maxRetries = parseInt(process.env.OLLAMA_MAX_RETRIES) || 2;
    
    console.log('[AIService] Initialized with:', {
      baseUrl: this.baseUrl,
      model: this.model,
      timeout: this.timeout
    });
  }

  /**
   * Generate a chat completion with full context
   * @param {Array} messages - Array of message objects [{role, content}]
   * @param {Object} options - Optional settings
   * @returns {Promise<string>} - The AI response content
   */
  async generateCompletion(messages, options = {}) {
    const { stream = false, onToken = null, temperature = 0.7 } = options;
    
    console.log('[AIService] Generating completion:', {
      messageCount: messages.length,
      stream: stream,
      model: this.model
    });

    let lastError = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[AIService] Attempt ${attempt}/${this.maxRetries}`);
        
        if (stream && onToken) {
          return await this._streamChat(messages, onToken, temperature);
        } else {
          return await this._nonStreamChat(messages, temperature);
        }
        
      } catch (error) {
        lastError = error;
        console.error(`[AIService] Attempt ${attempt} failed:`, error.message);
        
        if (attempt < this.maxRetries) {
          const delay = Math.min(1000 * attempt, 5000);
          console.log(`[AIService] Retrying in ${delay}ms...`);
          await this._sleep(delay);
        }
      }
    }
    
    throw this._formatError(lastError);
  }

  /**
   * Non-streaming chat completion
   */
  async _nonStreamChat(messages, temperature) {
    try {
      // Try the chat endpoint first (OpenAI compatible)
      const response = await axios.post(
        `${this.baseUrl}/api/chat`,
        {
          model: this.model,
          messages: messages,
          stream: false,
          options: {
            temperature: temperature
          }
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('[AIService] Chat endpoint response:', {
        status: response.status,
        hasMessage: !!response.data?.message?.content
      });

      // Ollama chat endpoint format
      if (response.data?.message?.content) {
        return response.data.message.content;
      }

      // Fallback to generate endpoint if chat doesn't work
      return await this._fallbackGenerate(messages, temperature);
      
    } catch (error) {
      console.log('[AIService] Chat endpoint failed, trying fallback:', error.message);
      return await this._fallbackGenerate(messages, temperature);
    }
  }

  /**
   * Streaming chat completion
   */
  async _streamChat(messages, onToken, temperature) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(
          `${this.baseUrl}/api/chat`,
          {
            model: this.model,
            messages: messages,
            stream: true,
            options: {
              temperature: temperature
            }
          },
          {
            timeout: this.timeout,
            headers: {
              'Content-Type': 'application/json'
            },
            responseType: 'stream'
          }
        );

        let fullResponse = '';
        let buffer = '';

        response.data.on('data', (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                
                if (data.message?.content) {
                  const token = data.message.content;
                  fullResponse += token;
                  onToken({
                    token,
                    fullResponse,
                    done: data.done || false
                  });
                }
                
                if (data.done) {
                  console.log('[AIService] Streaming completed, length:', fullResponse.length);
                }
              } catch (parseError) {
                console.error('[AIService] Error parsing stream line:', line, parseError.message);
              }
            }
          }
        });

        response.data.on('end', () => {
          resolve(fullResponse);
        });

        response.data.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        // If streaming fails, fall back to non-streaming
        console.log('[AIService] Streaming failed, using non-stream fallback');
        try {
          const response = await this._nonStreamChat(messages, temperature);
          // Simulate streaming by sending the whole response as one token
          onToken({
            token: response,
            fullResponse: response,
            done: true
          });
          resolve(response);
        } catch (fallbackError) {
          reject(fallbackError);
        }
      }
    });
  }

  /**
   * Fallback to generate endpoint (older Ollama API)
   */
  async _fallbackGenerate(messages, temperature) {
    // Convert messages array to prompt string
    const prompt = messages.map(m => {
      if (m.role === 'system') return `System: ${m.content}`;
      if (m.role === 'user') return `User: ${m.content}`;
      return `Assistant: ${m.content}`;
    }).join('\n\n') + '\n\nAssistant:';

    const response = await axios.post(
      `${this.baseUrl}/api/generate`,
      {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: temperature
        }
      },
      {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('[AIService] Generate endpoint response:', {
      status: response.status,
      hasResponse: !!response.data?.response
    });

    if (response.data?.response) {
      return response.data.response;
    }

    throw new Error('Invalid response from Ollama generate endpoint');
  }

  /**
   * Check if Ollama service is available
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000
      });
      
      const models = response.data?.models || [];
      const hasModel = models.some(m => m.name === this.model || m.model === this.model);
      
      return {
        healthy: true,
        modelAvailable: hasModel,
        availableModels: models.map(m => m.name || m.model)
      };
    } catch (error) {
      return {
        healthy: false,
        modelAvailable: false,
        error: error.message
      };
    }
  }

  /**
   * Format error for consistent handling
   */
  _formatError(error) {
    let message = 'AI service error';
    let code = 'UNKNOWN_ERROR';

    if (error.code === 'ECONNREFUSED') {
      message = 'Ollama service is not running. Please start it with: ollama serve';
      code = 'SERVICE_UNAVAILABLE';
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      message = 'Request timed out. The model may be loading or overloaded.';
      code = 'TIMEOUT';
    } else if (error.response?.status === 404) {
      message = `Model "${this.model}" not found. Please pull it first: ollama pull ${this.model}`;
      code = 'MODEL_NOT_FOUND';
    } else if (error.message) {
      message = error.message;
    }

    const formattedError = new Error(message);
    formattedError.code = code;
    formattedError.originalError = error;
    
    return formattedError;
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new AIService();
