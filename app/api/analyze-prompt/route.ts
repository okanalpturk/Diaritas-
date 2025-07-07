import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    const systemPrompt = `You are a life coach analyzing daily activities to adjust RPG-style character attributes. 

Analyze the user's daily activities and provide:
1. A detailed analysis of their day (2-3 sentences)
2. Attribute changes with reasons

The 10 attributes are:
- vitality: Physical health, energy, stamina
- discipline: Self-control, consistency, dedication
- creativity: Imagination, innovation, artistic expression
- curiosity: Desire to learn, explore, understand
- empathy: Understanding others' feelings
- sociality: Social skills, connection with others
- resilience: Ability to recover from setbacks
- courage: Bravery to face challenges, take risks
- wisdom: Deep understanding, good judgment
- integrity: Honesty, moral principles, authenticity

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
      const errorData = await response.text()
      console.error('OpenAI API Error:', response.status, errorData)
      
      if (response.status === 401) {
        return NextResponse.json({ 
          error: 'Invalid OpenAI API key. Please check your API key configuration.' 
        }, { status: 401 })
      }
      
      if (response.status === 429) {
        return NextResponse.json({ 
          error: 'OpenAI API rate limit exceeded. Please try again later.' 
        }, { status: 429 })
      }
      
      return NextResponse.json({ 
        error: `OpenAI API error: ${response.status} ${response.statusText}`,
        details: errorData
      }, { status: response.status })
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenAI response format:', data)
      return NextResponse.json({ error: 'Unexpected response format from OpenAI' }, { status: 500 })
    }
    
    const gptResponse = data.choices[0].message.content
    
    // Parse the JSON response with error handling
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
      console.error('Failed to parse OpenAI response as JSON:', gptResponse)
      
      const parseErrorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error'
      
      return NextResponse.json({ 
        error: `Invalid JSON response from OpenAI: ${parseErrorMessage}`,
        rawResponse: gptResponse
      }, { status: 500 })
    }
    
    if (!parsedResponse.analysis || !parsedResponse.attributeChanges) {
      console.error('Invalid response structure from OpenAI:', parsedResponse)
      return NextResponse.json({ 
        error: 'Invalid response structure from OpenAI',
        receivedResponse: parsedResponse
      }, { status: 500 })
    }
    
    return NextResponse.json(parsedResponse)
    
  } catch (error) {
    console.error('Error analyzing prompt:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze prompt', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}