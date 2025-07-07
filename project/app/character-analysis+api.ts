export async function POST(request: Request) {
  try {
    const { profile, history } = await request.json();
    
    if (!profile || !history) {
      return new Response(JSON.stringify({ error: 'Profile and history are required' }), {
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

    // Prepare attribute summary
    const attributeSummary = profile.attributes.map(attr => 
      `${attr.name}: ${attr.value} (${attr.description})`
    ).join('\n');

    // Prepare recent activity summary (last 10 entries)
    const recentActivities = history.slice(0, 10).map(entry => ({
      prompt: entry.prompt,
      analysis: entry.analysis,
      changes: entry.attributeChanges.map(change => 
        `${change.attribute}: ${change.change > 0 ? '+' : ''}${change.change} (${change.reason})`
      ).join(', ')
    }));

    // Detect language from user's prompts
    const userPrompts = history.slice(0, 10).map(entry => entry.prompt).join(' ');
    const languageDetectionPrompt = userPrompts.length > 0 ? 
      `Based on the user's chat history, detect their primary language and respond in that language. User's recent prompts: "${userPrompts.substring(0, 500)}..."` : 
      'Respond in English as default.';

    const systemPrompt = `You are a character analyst specializing in RPG-style personality assessment. Analyze the user's character based on their attribute values and recent activity history.

CRITICAL: ${languageDetectionPrompt}

LANGUAGE INSTRUCTION: Analyze the language used in the user's chat history and provide the ENTIRE analysis in that same language. If the user writes in Spanish, respond in Spanish. If they write in French, respond in French. If they write in Japanese, respond in Japanese, etc. Maintain the same language throughout the entire response.

Current Attributes:
${attributeSummary}

Character Stats:
- Total Prompts: ${profile.totalPrompts}
- Current Streak: ${profile.streak} days
- Character Name: ${profile.characterName || 'Unnamed'}

Provide a comprehensive character analysis in the language of the users chat history. including:

1. **Character Archetype**: What type of character are they? (e.g., "The Balanced Explorer", "The Creative Warrior", "The Wise Empath")

2. **Dominant Traits**: Which 3 attributes define them most strongly and what this reveals about their personality

3. **Growth Areas**: Which attributes could use development and specific suggestions for improvement

4. **Personality Insights**: Deep analysis of their character based on attribute patterns and activity history

5. **Character Evolution**: How their character has been developing based on recent activities (if history available)

6. **Strengths & Superpowers**: What makes this character unique and powerful

7. **Life Philosophy**: What their attribute balance suggests about their approach to life

8. **Character Quote**: A personalized quote that captures their essence

Keep the analysis engaging, insightful, and motivational. Use RPG/fantasy language while remaining practical and applicable to real life.

IMPORTANT: The entire response must be in the same language as detected from the user's chat history. Do not mix languages.

Respond in JSON format:
{
  "archetype": "Character archetype name",
  "dominantTraits": [
    {
      "attribute": "attribute_name",
      "insight": "What this reveals about them"
    }
  ],
  "growthAreas": [
    {
      "attribute": "attribute_name", 
      "suggestion": "Specific improvement suggestion"
    }
  ],
  "personalityInsights": "Deep personality analysis paragraph",
  "characterEvolution": "How they've been developing",
  "strengths": ["List of key strengths"],
  "lifePhilosophy": "Their approach to life based on attributes",
  "characterQuote": "Personalized inspirational quote"
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
          { 
            role: 'user', 
            content: `Analyze this character and respond in the same language as their chat history. Recent activities: ${JSON.stringify(recentActivities)}` 
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', response.status, errorData);
      
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
      
      const parseErrorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      
      return new Response(JSON.stringify({ 
        error: `Invalid JSON response from OpenAI: ${parseErrorMessage}`,
        rawResponse: gptResponse
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Validate the parsed response structure
    if (!parsedResponse.archetype || !parsedResponse.personalityInsights) {
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
    console.error('Error analyzing character:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to analyze character', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}