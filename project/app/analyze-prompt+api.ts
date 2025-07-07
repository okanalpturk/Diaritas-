export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are a life coach analyzing daily activities to adjust RPG-style character attributes. 

Analyze the user's daily activities and provide:
1. A detailed analysis of their day (2-3 sentences)
2. Attribute changes with reasons

The 10 attributes are:
- Vitality: Physical health, energy, stamina
- Discipline: Self-control, consistency, dedication
- Creativity: Imagination, innovation, artistic expression
- Curiosity: Desire to learn, explore, understand
- Empathy: Understanding others' feelings
- Sociality: Social skills, connection with others
- Resilience: Ability to recover from setbacks
- Courage: Bravery to face challenges, take risks
- Wisdom: Deep understanding, good judgment
- Integrity: Honesty, moral principles, authenticity

For each relevant attribute, provide a change between -5 and +5 points with a clear reason.

Respond in JSON format:
{
  "analysis": "Your detailed analysis...",
  "attributeChanges": [
    {
      "attribute": "vitality",
      "change": 2,
      "reason": "Exercise increases physical health and energy"
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', response.status, errorData);
      
      // Handle specific OpenAI API errors
      if (response.status === 401) {
        return new Response(JSON.stringify({ 
          error: 'Invalid OpenAI API key. Please check your API key configuration.' 
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'OpenAI API rate limit exceeded. Please try again later.' 
        }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${response.status} ${response.statusText}`,
        details: errorData
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenAI response format:', data);
      return new Response(JSON.stringify({ error: 'Unexpected response format from OpenAI' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const gptResponse = data.choices[0].message.content;
    
    // Parse the JSON response with error handling
    let parsedResponse;
    try {
      // Extract JSON from potential markdown code blocks
      let cleanJsonString = gptResponse.trim();
      
      // Check if response is wrapped in markdown code blocks
      const jsonCodeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
      const match = cleanJsonString.match(jsonCodeBlockRegex);
      
      if (match) {
        // Extract content from code block
        cleanJsonString = match[1].trim();
      }
      
      // Remove any leading/trailing text that might not be JSON
      const jsonStartIndex = cleanJsonString.indexOf('{');
      const jsonEndIndex = cleanJsonString.lastIndexOf('}');
      
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
        cleanJsonString = cleanJsonString.substring(jsonStartIndex, jsonEndIndex + 1);
      }
      
      parsedResponse = JSON.parse(cleanJsonString);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', gptResponse);
      
      // Try to fix common JSON issues
      try {
        let fixedJsonString = cleanJsonString
          .replace(/,\s*}/g, '}') // Remove trailing commas
          .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
          .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
          .replace(/\+(\d+)/g, '$1'); // Remove + signs from numbers
        
        parsedResponse = JSON.parse(fixedJsonString);
      } catch (secondParseError) {
        console.error('Failed to parse OpenAI response after cleanup:', secondParseError);
        
        // Construct a more descriptive error message
        const parseErrorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      
        return new Response(JSON.stringify({ 
          error: `Invalid JSON response from OpenAI: ${parseErrorMessage}`,
          rawResponse: gptResponse
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Validate the parsed response structure
    if (!parsedResponse.analysis || !parsedResponse.attributeChanges) {
      console.error('Invalid response structure from OpenAI:', parsedResponse);
      return new Response(JSON.stringify({ 
        error: 'Invalid response structure from OpenAI',
        receivedResponse: parsedResponse
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify(parsedResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error analyzing prompt:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to analyze prompt', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}