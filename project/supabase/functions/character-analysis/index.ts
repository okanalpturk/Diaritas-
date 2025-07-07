import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { profile, history } = await req.json()
    
    if (!profile || !history) {
      return new Response(JSON.stringify({ error: 'Profile and history are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Prepare attribute summary
    const attributeSummary = profile.attributes.map(attr => 
      `${attr.name}: ${attr.value} (${attr.description})`
    ).join('\n')

    // Prepare recent activity summary
    const recentActivities = history.slice(0, 10).map(entry => ({
      prompt: entry.prompt,
      analysis: entry.analysis,
      changes: entry.attributeChanges.map(change => 
        `${change.attribute}: ${change.change > 0 ? '+' : ''}${change.change} (${change.reason})`
      ).join(', ')
    }))

    const userPrompts = history.slice(0, 10).map(entry => entry.prompt).join(' ')
    const languageDetectionPrompt = userPrompts.length > 0 ? 
      `Based on the user's chat history, detect their primary language and respond in that language. User's recent prompts: "${userPrompts.substring(0, 500)}..."` : 
      'Respond in English as default.'

    const systemPrompt = `You are a character analyst specializing in RPG-style personality assessment. Analyze the user's character based on their attribute values and recent activity history.

CRITICAL: ${languageDetectionPrompt}

Current Attributes:
${attributeSummary}

Character Stats:
- Total Prompts: ${profile.totalPrompts}
- Current Streak: ${profile.streak} days
- Character Name: ${profile.characterName || 'Unnamed'}

Provide a comprehensive character analysis including:
1. Character Archetype
2. Dominant Traits
3. Growth Areas
4. Personality Insights
5. Character Evolution
6. Strengths & Superpowers
7. Life Philosophy
8. Character Quote

Respond in JSON format with the structure provided in the original prompt.`

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
            content: `Analyze this character. Recent activities: ${JSON.stringify(recentActivities)}` 
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const gptResponse = data.choices[0].message.content
    
    // Parse JSON response (same logic as analyze-prompt)
    let parsedResponse
    try {
      let cleanJsonString = gptResponse.trim()
      const jsonCodeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/
      const match = cleanJsonString.match(jsonCodeBlockRegex)
      
      if (match) {
        cleanJsonString = match[1].trim()
      }
      
      const jsonStartIndex = cleanJsonString.indexOf('{')
      const jsonEndIndex = cleanJsonString.lastIndexOf('}')
      
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
        cleanJsonString = cleanJsonString.substring(jsonStartIndex, jsonEndIndex + 1)
      }
      
      parsedResponse = JSON.parse(cleanJsonString)
    } catch (parseError) {
      throw new Error('Failed to parse OpenAI response')
    }
    
    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to analyze character', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})