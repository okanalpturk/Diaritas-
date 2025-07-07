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
    const { prompt } = await req.json()
    
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
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
}`

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
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const gptResponse = data.choices[0].message.content
    
    // Parse JSON response
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
      error: 'Failed to analyze prompt', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})