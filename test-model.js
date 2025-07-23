// Test script to try different OpenRouter models

const apiKey = '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';

async function testModel(model) {
  try {
    console.log(`Testing model: ${model}`);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Hiring Platform Test'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello, can you hear me?' }
        ]
      })
    });

    const data = await response.json();
    console.log(`Model: ${model}`);
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('---\n');
    
  } catch (error) {
    console.error(`Error with model ${model}:`, error.message);
  }
}

// Test different models
async function runTests() {
  const models = [
    'google/gemini-pro',
    'anthropic/claude-3-haiku',
    'meta-llama/llama-3-70b-instruct'
  ];
  
  for (const model of models) {
    await testModel(model);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }
}

runTests();
