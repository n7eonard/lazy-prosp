import { corsHeaders } from './types.ts';
import { authenticateUser } from './auth.ts';
import { extractCountryCode } from './location.ts';
import { searchProspects } from './theorg-api.ts';
import { transformProspects } from './data-transform.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting prospect search using theorg.com API...');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Authenticate user
    const user = await authenticateUser(req);
    console.log('User authenticated successfully:', user.id);

    // Get the API key for theorg.com
    const theorgApiKey = Deno.env.get('THEORG_API_KEY');
    if (!theorgApiKey) {
      return new Response(JSON.stringify({ 
        error: 'THEORG_API_KEY not configured. Please set up your API key.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract country code from user's LinkedIn data
    const countryCode = extractCountryCode(user);

    // Define target job titles for prospect search
    const targetTitles = [
      'Chief Product Officer',
      'VP Product', 
      'VP of Product',
      'Head of Product',
      'Vice President of Product',
      'Director of Product',
      'Product Director',
      'CPO'
    ];

    // Search for prospects using theorg.com API
    const allProspects = await searchProspects(theorgApiKey, countryCode, targetTitles);

    console.log(`Total unique prospects found: ${allProspects.length}`);

    // Transform the data to match our database schema
    const transformedProspects = transformProspects(allProspects, countryCode);

    console.log(`Transformed ${transformedProspects.length} prospects`);

    return new Response(JSON.stringify({ 
      success: true,
      prospects: transformedProspects,
      count: transformedProspects.length,
      searchLocation: countryCode,
      searchTitles: targetTitles
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in search-prospects function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});