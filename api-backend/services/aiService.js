const axios = require('axios');

/**
 * AI Service - Robust Ollama Integration
 * Handles communication with the local llama3:latest model via Ollama
 */
class AIService {
  constructor() {
    this.baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3:latest';
    this.timeout = parseInt(process.env.OLLAMA_TIMEOUT) || 300000; // 5 minutes default
    this.maxRetries = parseInt(process.env.OLLAMA_MAX_RETRIES) || 2;

    this.geminiApiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;
    this.geminiModel = 'gemini-flash-latest';
    this.useGemini = !!this.geminiApiKey;
    
    console.log('[AIService] Initialized with:', {
      baseUrl: this.baseUrl,
      model: this.model,
      timeout: this.timeout,
      useGemini: this.useGemini,
      geminiModel: this.geminiModel
    });
  }

  /**
   * Helper to convert OpenAI/Ollama messages to Gemini API format
   */
  _convertToGemini(messages) {
    let systemInstruction = null;
    const contents = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = {
          parts: [{ text: msg.content }]
        };
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    // Gemini requires at least one user message in contents
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Hello' }]
      });
    }

    return { contents, systemInstruction };
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
      model: this.useGemini ? this.geminiModel : this.model,
      engine: this.useGemini ? 'Gemini' : 'Ollama'
    });

    let lastError = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[AIService] Attempt ${attempt}/${this.maxRetries}`);
        
        if (this.useGemini) {
          if (stream && onToken) {
            return await this._geminiStreamChat(messages, onToken, temperature);
          } else {
            return await this._geminiNonStreamChat(messages, temperature);
          }
        } else {
          if (stream && onToken) {
            return await this._streamChat(messages, onToken, temperature);
          } else {
            return await this._nonStreamChat(messages, temperature);
          }
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
   * Gemini Non-streaming chat completion
   */
  async _geminiNonStreamChat(messages, temperature) {
    const { contents, systemInstruction } = this._convertToGemini(messages);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;
    
    const response = await axios.post(
      url,
      {
        contents,
        ...(systemInstruction && { systemInstruction }),
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: 4096
        }
      },
      {
        timeout: 60000,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('[AIService] No text in Gemini response:', JSON.stringify(response.data, null, 2));
      throw new Error('No content received from Gemini API');
    }
    return text;
  }

  /**
   * Gemini Streaming chat completion
   */
  async _geminiStreamChat(messages, onToken, temperature) {
    const { contents, systemInstruction } = this._convertToGemini(messages);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:streamGenerateContent?key=${this.geminiApiKey}&alt=sse`;
    
    const response = await axios.post(
      url,
      {
        contents,
        ...(systemInstruction && { systemInstruction }),
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: 4096
        }
      },
      {
        timeout: 60000,
        headers: { 'Content-Type': 'application/json' },
        responseType: 'stream'
      }
    );

    return new Promise((resolve, reject) => {
      let fullResponse = '';
      let buffer = '';

      response.data.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.substring(5).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              const token = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (token) {
                fullResponse += token;
                onToken({
                  token,
                  fullResponse,
                  done: false
                });
              }
            } catch (err) {
              // Ignore parse errors on partial stream lines or empty data
            }
          }
        }
      });

      response.data.on('end', () => {
        onToken({
          token: '',
          fullResponse,
          done: true
        });
        resolve(fullResponse);
      });

      response.data.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Ollama Non-streaming chat completion
   */
  async _nonStreamChat(messages, temperature) {
    try {
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

      if (response.data?.message?.content) {
        return response.data.message.content;
      }

      return await this._fallbackGenerate(messages, temperature);
      
    } catch (error) {
      console.log('[AIService] Chat endpoint failed, trying fallback:', error.message);
      return await this._fallbackGenerate(messages, temperature);
    }
  }

  /**
   * Ollama Streaming chat completion
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
        console.log('[AIService] Streaming failed, using non-stream fallback');
        try {
          const response = await this._nonStreamChat(messages, temperature);
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

    if (response.data?.response) {
      return response.data.response;
    }

    throw new Error('Invalid response from Ollama generate endpoint');
  }

  /**
   * Check if service is available
   */
  async healthCheck() {
    if (this.useGemini) {
      try {
        const response = await axios.get(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${this.geminiApiKey}`,
          { timeout: 5000 }
        );
        return {
          healthy: true,
          modelAvailable: response.data?.models?.some(m => m.name.includes(this.geminiModel)) || false,
          availableModels: [this.geminiModel],
          engine: 'Gemini'
        };
      } catch (error) {
        return {
          healthy: false,
          modelAvailable: false,
          error: `Gemini API check failed: ${error.message}`,
          engine: 'Gemini'
        };
      }
    }

    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000
      });
      
      const models = response.data?.models || [];
      const hasModel = models.some(m => m.name === this.model || m.model === this.model);
      
      return {
        healthy: true,
        modelAvailable: hasModel,
        availableModels: models.map(m => m.name || m.model),
        engine: 'Ollama'
      };
    } catch (error) {
      return {
        healthy: false,
        modelAvailable: false,
        error: error.message,
        engine: 'Ollama'
      };
    }
  }

  /**
   * Format error for consistent handling
   */
  _formatError(error) {
    if (this.useGemini) {
      return new Error(error.response?.data?.error?.message || error.message || 'Gemini API Error');
    }

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

