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
  startDate?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting theorg.com scraping...');
    
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

    // Get user's profile to determine location from LinkedIn data
    console.log('Fetching user profile for LinkedIn location...');
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('Profile data:', profile);

    // Extract location from LinkedIn user metadata or profile
    let userLocation = 'San Francisco'; // Default fallback
    
    // Try to get location from user metadata (LinkedIn profile)
    if (user.user_metadata?.location) {
      userLocation = user.user_metadata.location;
    } else if (user.user_metadata?.locality) {
      userLocation = user.user_metadata.locality;
    } else if (user.user_metadata?.country) {
      userLocation = user.user_metadata.country;
    }

    console.log(`User location determined: ${userLocation}`);

    // Search for positions using theorg.com API
    console.log('Searching for CPOs and VP Products on theorg.com...');
    
    const searchTitles = [
      'Chief Product Officer',
      'VP Product', 
      'Head of Product',
      'VP of Product',
      'Vice President of Product'
    ];

    const allPositions: TheOrgPosition[] = [];

    for (const title of searchTitles) {
      try {
        console.log(`Searching for positions with title: ${title} in ${userLocation}`);
        
        const apiUrl = `https://api.theorg.com/v1/positions?title=${encodeURIComponent(title)}&location=${encodeURIComponent(userLocation)}&limit=10`;
        console.log(`API URL: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          headers: {
            'X-Api-Key': theorgApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API request failed for title ${title}:`, response.status, response.statusText, errorText);
          continue;
        }

        const data = await response.json();
        console.log(`API Response for ${title}:`, JSON.stringify(data, null, 2));
        console.log(`Found ${data.data?.length || 0} positions for ${title}`);
        
        if (data.data && Array.isArray(data.data)) {
          console.log(`Adding ${data.data.length} positions to results`);
          allPositions.push(...data.data);
        } else {
          console.log(`No data array found in response for ${title}`);
        }
      } catch (error) {
        console.error(`Error searching for ${title}:`, error);
      }
    }

    console.log(`Total positions found: ${allPositions.length}`);

    // Transform the data to match our interface
    const transformedProfiles = allPositions.map(position => ({
      name: position.name || 'N/A',
      title: position.title || 'N/A',
      company: position.company?.name || 'N/A',
      location: position.location || userLocation,
      avatar_url: position.profilePhotoUrl,
      linkedin_url: position.linkedInUrl,
      work_email: position.workEmail,
      start_date: position.startDate
    }));

    console.log(`Transformed ${transformedProfiles.length} profiles from theorg.com`);

    return new Response(JSON.stringify({ 
      success: true,
      profiles: transformedProfiles,
      count: transformedProfiles.length,
      userLocation
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-theorg function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});