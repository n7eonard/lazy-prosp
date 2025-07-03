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
    
    console.log('Debug - Original name:', name)
    console.log('Debug - Clean name:', cleanName)
    console.log('Debug - First name:', firstName)
    
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
    
    // Calculate tenure information - avoid undefined values
    let tenureInfo = ''
    if (startDate && startDate !== 'undefined' && startDate !== null) {
      try {
        const start = new Date(startDate)
        const now = new Date()
        
        // Check if date is valid
        if (!isNaN(start.getTime())) {
          const monthsDiff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
          
          if (monthsDiff >= 12) {
            const years = Math.floor(monthsDiff / 12)
            tenureInfo = `${firstName} has been working at ${company} for ${years === 1 ? '1 year' : `${years} years`}`
          } else if (monthsDiff > 0) {
            tenureInfo = `${firstName} recently joined ${company}`
          } else {
            tenureInfo = `${firstName} works at ${company}`
          }
        } else {
          tenureInfo = `${firstName} works at ${company}`
        }
      } catch (e) {
        tenureInfo = `${firstName} works at ${company}`
      }
    } else {
      tenureInfo = `${firstName} works at ${company}`
    }

    const prompt = `You are an expert LinkedIn outreach specialist and business intelligence researcher. You must conduct deep research and write highly intelligent, factual intro messages.

CRITICAL RESEARCH REQUIREMENTS:
1. Search for recent company news, press releases, funding rounds, product launches
2. Look for industry trends affecting ${company}
3. Find leadership changes, partnerships, acquisitions, or strategic initiatives
4. Research their competitive positioning and market challenges
5. Identify specific product developments or technology initiatives

WRITE IN ${targetLanguage.name} LANGUAGE.

Target Prospect Analysis:
- Name: ${cleanName} (${title})
- Company: ${company}
- Location: ${location}
- ${tenureInfo}
${workEmail ? `- Email: ${workEmail}` : ''}

RESEARCH MISSION: Find 1-2 specific, recent, verifiable facts about ${company} that a product strategy expert would reference in conversation.

Examples of good research findings:
- "saw your Series B announcement"
- "noticed your new AI product launch"
- "read about your expansion into European markets"
- "following your partnership with [Company]"
- "impressed by your team's growth to 200+ people"

WRITE A SOPHISTICATED MESSAGE THAT:
1. Opens with the prospect's name
2. References ONE specific, recent fact you researched about their company
3. Demonstrates deep understanding of product strategy challenges
4. Positions me as someone who helps scale product teams and optimize strategy
5. Includes a natural, consultative call-to-action
6. Uses professional but warm tone in ${targetLanguage.name}
7. Stays under 300 characters (STRICT LIMIT)

AVOID generic phrases. INCLUDE specific research findings. BE AUTHENTIC.

Return ONLY the message text in ${targetLanguage.name}, no explanations.`

    // Simulate research phases with delays
    await new Promise(resolve => setTimeout(resolve, 2000)) // Company research phase
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiApiKey}`, {
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
          temperature: 0.9,
          topK: 50,
          topP: 0.95,
          maxOutputTokens: 250,
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

    // Clean up the message and ensure it's under 300 characters
    generatedMessage = generatedMessage.trim().replace(/^["']|["']$/g, '')
    
    if (generatedMessage.length > 300) {
      generatedMessage = generatedMessage.substring(0, 297) + '...'
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