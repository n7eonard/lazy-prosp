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
    const { name, title, company, location, workEmail, startDate, countryCode } = await req.json()
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables')
    }

    // Ensure name is properly formatted
    const cleanName = name?.trim() || 'Professional'
    const firstName = cleanName.split(' ')[0] || cleanName
    
    // Language mapping based on country code
    const languageMap: { [key: string]: { code: string, name: string } } = {
      'US': { code: 'en', name: 'English' },
      'CA': { code: 'en', name: 'English' },
      'GB': { code: 'en', name: 'English' },
      'FR': { code: 'fr', name: 'French' },
      'DE': { code: 'de', name: 'German' },
      'ES': { code: 'es', name: 'Spanish' },
      'IT': { code: 'it', name: 'Italian' },
      'NL': { code: 'nl', name: 'Dutch' },
      'AU': { code: 'en', name: 'English' },
      'SG': { code: 'en', name: 'English' },
      'JP': { code: 'ja', name: 'Japanese' },
      'KR': { code: 'ko', name: 'Korean' },
    }

    const targetLanguage = languageMap[countryCode] || { code: 'en', name: 'English' }
    
    // Calculate tenure information
    let tenureInfo = ''
    if (startDate && startDate !== 'undefined') {
      try {
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
      } catch (e) {
        tenureInfo = `${firstName} works at ${company}`
      }
    } else {
      tenureInfo = `${firstName} works at ${company}`
    }

    const prompt = `You are an expert LinkedIn outreach specialist with deep market research capabilities. 

IMPORTANT: Write the entire message in ${targetLanguage.name} language.

Research Task: Conduct comprehensive research about ${company} and write a highly personalized LinkedIn connection request message for ${firstName} who works as ${title} at ${company} in ${location}.

Research Areas to Investigate:
1. Recent company news, press releases, and announcements
2. Product launches, updates, or new initiatives  
3. Industry trends affecting ${company}
4. Company achievements, funding rounds, or partnerships
5. Market positioning and competitive landscape
6. Leadership changes or strategic shifts

Context about the prospect:
- Name: ${cleanName}
- Job Title: ${title}
- Company: ${company}
- Location: ${location}
- ${tenureInfo}
${workEmail ? `- Work Email: ${workEmail}` : ''}

Based on your research, write a professional yet friendly LinkedIn intro message that:
1. References specific recent company news, achievements, or industry developments
2. Shows genuine understanding of their role and company challenges
3. Demonstrates how I can help with product scaling and strategy optimization
4. Is highly personalized to their specific situation and company context
5. Stays under 270 characters (strict limit for LinkedIn)
6. Uses a professional but approachable tone in ${targetLanguage.name}
7. Includes a soft call to action that feels natural

Focus on being genuinely helpful and insightful rather than sales-oriented. Make it feel like a valuable connection request from an expert in the product/strategy space.

CRITICAL: Write the ENTIRE message in ${targetLanguage.name}. Return ONLY the message text, no quotes or explanations.`

    // Simulate research phases with delays
    await new Promise(resolve => setTimeout(resolve, 2000)) // Company research phase
    
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
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
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

    // Clean up the message and ensure it's under 270 characters
    generatedMessage = generatedMessage.trim().replace(/^["']|["']$/g, '')
    
    if (generatedMessage.length > 270) {
      generatedMessage = generatedMessage.substring(0, 267) + '...'
    }

    // Add another delay for message crafting phase
    await new Promise(resolve => setTimeout(resolve, 1500))

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