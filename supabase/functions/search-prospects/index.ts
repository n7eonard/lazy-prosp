import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TheOrgPosition {
  id: string;
  name: string;
  title: string;
  company: {
    name: string;
    domain?: string;
  };
  location?: string;
  linkedInUrl?: string;
  profilePhotoUrl?: string;
  workEmail?: string;
  personalEmail?: string;
  phoneNumber?: string;
  startDate?: string;
}

interface TheOrgResponse {
  data: TheOrgPosition[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting prospect search using theorg.com API...');
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', user.id);

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

    // Extract location from LinkedIn user metadata
    let userLocation = 'United States'; // Default fallback
    
    console.log('User metadata:', user.user_metadata);
    
    if (user.user_metadata?.location) {
      userLocation = user.user_metadata.location;
    } else if (user.user_metadata?.locality) {
      userLocation = user.user_metadata.locality;
    } else if (user.user_metadata?.country) {
      userLocation = user.user_metadata.country;
    }

    console.log(`User location determined: ${userLocation}`);

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

    const allProspects: TheOrgPosition[] = [];

    // Search for each title using theorg.com Position API
    for (const title of targetTitles) {
      try {
        console.log(`Searching for: ${title} in ${userLocation}`);
        
        // Build API URL with proper parameters
        const searchParams = new URLSearchParams({
          title: title,
          location: userLocation,
          limit: '25'
        });
        
        const apiUrl = `https://api.theorg.com/v1/positions?${searchParams.toString()}`;
        console.log(`API URL: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'X-Api-Key': theorgApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log(`Response status for ${title}: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API request failed for ${title}:`, response.status, response.statusText, errorText);
          
          // If we get a 429 (rate limit), wait and continue
          if (response.status === 429) {
            console.log('Rate limited, waiting 1 second...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }

        const responseData: TheOrgResponse = await response.json();
        console.log(`Found ${responseData.data?.length || 0} positions for ${title}`);
        
        if (responseData.data && Array.isArray(responseData.data)) {
          // Filter out duplicates based on LinkedIn URL or email
          const newProspects = responseData.data.filter(prospect => {
            const exists = allProspects.some(existing => 
              (existing.linkedInUrl && prospect.linkedInUrl && existing.linkedInUrl === prospect.linkedInUrl) ||
              (existing.workEmail && prospect.workEmail && existing.workEmail === prospect.workEmail) ||
              (existing.name === prospect.name && existing.company.name === prospect.company.name)
            );
            return !exists;
          });
          
          allProspects.push(...newProspects);
          console.log(`Added ${newProspects.length} new unique prospects (${allProspects.length} total)`);
        }

        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error searching for ${title}:`, error);
      }
    }

    console.log(`Total unique prospects found: ${allProspects.length}`);

    // Transform the data to match our database schema
    const transformedProspects = allProspects.map(prospect => ({
      name: prospect.name || 'Unknown',
      title: prospect.title || 'Unknown Title',
      company: prospect.company?.name || 'Unknown Company',
      location: prospect.location || userLocation,
      avatar_url: prospect.profilePhotoUrl || null,
      linkedin_url: prospect.linkedInUrl || null,
      mutual_connections: 0, // We'll set this to 0 since we're not analyzing connections
      profile_data: {
        work_email: prospect.workEmail || null,
        personal_email: prospect.personalEmail || null,
        phone_number: prospect.phoneNumber || null,
        start_date: prospect.startDate || null,
        company_domain: prospect.company?.domain || null,
        source: 'theorg.com'
      }
    }));

    console.log(`Transformed ${transformedProspects.length} prospects`);

    return new Response(JSON.stringify({ 
      success: true,
      prospects: transformedProspects,
      count: transformedProspects.length,
      searchLocation: userLocation,
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