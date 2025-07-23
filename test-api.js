// Simple test script to check OpenRouter API connection

const apiKey = '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';

async function testAPI() {
  try {
    console.log('Testing OpenRouter API connection...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Hiring Platform Test'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello, can you hear me?' }
        ]
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
