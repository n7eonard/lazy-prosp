import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { name, title, company, location, workEmail, startDate } = await req.json()
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables')
    }

    const firstName = name.split(' ')[0]
    
    // Calculate tenure information
    let tenureInfo = ''
    if (startDate) {
      const start = new Date(startDate)
      const now = new Date()
      const monthsDiff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
      
      if (monthsDiff >= 12) {
        const years = Math.floor(monthsDiff / 12)
        tenureInfo = `${firstName} has been working at ${company} for ${years === 1 ? '1 year' : `${years} years`}`
      } else if (monthsDiff > 0) {
        tenureInfo = `${firstName} recently joined ${company}`
      } else {
        tenureInfo = `${firstName} works at ${company}`
      }
    }

    const prompt = `You are an expert LinkedIn outreach specialist. Write a highly personalized LinkedIn connection request message for ${firstName} who works as ${title} at ${company} in ${location}.

Context about the prospect:
- Name: ${name}
- Job Title: ${title}
- Company: ${company}
- Location: ${location}
- ${tenureInfo}
${workEmail ? `- Work Email: ${workEmail}` : ''}

Research the company ${company} for recent news, achievements, product launches, or industry trends that could be relevant for a personalized outreach.

Write a professional yet friendly LinkedIn intro message that:
1. Uses recent company news or achievements as a conversation starter
2. Demonstrates genuine interest in their work/company
3. Mentions how I can help with product scaling and strategy
4. Is personalized to their specific role and company
5. Stays under 280 characters (strict limit)
6. Has a professional but approachable tone
7. Includes a clear but soft call to action

Focus on being helpful rather than sales-oriented. Make it feel like a genuine connection request from someone in the product/strategy space.

Return ONLY the message text, no quotes or explanations.`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 150,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    let generatedMessage = data.candidates[0]?.content?.parts[0]?.text || ''

    // Clean up the message and ensure it's under 280 characters
    generatedMessage = generatedMessage.trim().replace(/^["']|["']$/g, '')
    
    if (generatedMessage.length > 280) {
      generatedMessage = generatedMessage.substring(0, 277) + '...'
    }

    return new Response(
      JSON.stringify({ message: generatedMessage }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error generating intro message:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate intro message',
        details: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})