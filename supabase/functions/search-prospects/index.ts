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

    // Extract country code from LinkedIn user metadata
    let countryCode = 'US'; // Default fallback
    
    console.log('User metadata:', user.user_metadata);
    
    // Try to extract country code from user metadata
    if (user.user_metadata?.country) {
      const country = user.user_metadata.country.toLowerCase();
      // Map common country names to ISO codes
      const countryMap: { [key: string]: string } = {
        'united states': 'US',
        'canada': 'CA',
        'united kingdom': 'GB',
        'germany': 'DE',
        'france': 'FR',
        'spain': 'ES',
        'italy': 'IT',
        'netherlands': 'NL',
        'australia': 'AU',
        'india': 'IN',
        'singapore': 'SG',
        'japan': 'JP',
        'brazil': 'BR',
        'mexico': 'MX'
      };
      countryCode = countryMap[country] || user.user_metadata.country.slice(0, 2).toUpperCase();
    } else if (user.user_metadata?.locale) {
      // Extract from locale like "en_US"
      const localeParts = user.user_metadata.locale.split('_');
      if (localeParts.length > 1) {
        countryCode = localeParts[1];
      }
    }

    console.log(`Country code determined: ${countryCode}`);

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

    // Make a single POST request to search for all titles
    let allProspects: TheOrgPosition[] = [];
    
    try {
      console.log(`Searching for product leaders in country: ${countryCode}`);
      
      const requestBody = {
        limit: 10,
        filters: {
          locations: {
            country: countryCode
          },
          jobTitles: targetTitles
        }
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('https://api.theorg.com/v1/positions', {
        method: 'POST',
        headers: {
          'X-Api-Key': theorgApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API request failed:`, response.status, response.statusText, errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const responseData: TheOrgResponse = await response.json();
      console.log(`Found ${responseData.data?.length || 0} positions`);
      console.log('Response data:', JSON.stringify(responseData, null, 2));
      
      allProspects = responseData.data || [];
      
    } catch (error) {
      console.error(`Error searching prospects:`, error);
      throw error;
    }

    console.log(`Total unique prospects found: ${allProspects.length}`);

    // Transform the data to match our database schema
    const transformedProspects = allProspects.map(prospect => ({
      name: prospect.name || 'Unknown',
      title: prospect.title || 'Unknown Title',
      company: prospect.company?.name || 'Unknown Company',
      location: prospect.location || countryCode,
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