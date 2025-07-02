import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConnectionAnalysis {
  linkedin_url: string;
  mutual_connections: number;
  connection_type: 'direct' | '2nd_degree' | 'none';
  mutual_connection_names?: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting LinkedIn connection analysis...');
    
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

    const { linkedin_urls } = await req.json();
    
    if (!linkedin_urls || !Array.isArray(linkedin_urls)) {
      return new Response(JSON.stringify({ error: 'Invalid request: linkedin_urls array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Analyzing connections for ${linkedin_urls.length} profiles...`);

    // Get user's LinkedIn access token from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('linkedin_access_token')
      .eq('user_id', user.id)
      .single();

    // In a real implementation, you would use the LinkedIn API to analyze connections
    // For now, we'll simulate the analysis with realistic data
    const connectionAnalyses: ConnectionAnalysis[] = linkedin_urls.map((url: string) => {
      // Simulate different connection levels
      const randomValue = Math.random();
      let connections = 0;
      let type: 'direct' | '2nd_degree' | 'none' = 'none';
      let mutualNames: string[] = [];

      if (randomValue > 0.7) {
        // 30% chance of having mutual connections
        connections = Math.floor(Math.random() * 5) + 1;
        type = connections > 2 ? '2nd_degree' : 'direct';
        
        // Generate realistic mutual connection names
        const possibleConnections = [
          'Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown',
          'Eva Martinez', 'Frank Garcia', 'Grace Lee', 'Henry Wilson'
        ];
        mutualNames = possibleConnections
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.min(connections, 3));
      }

      return {
        linkedin_url: url,
        mutual_connections: connections,
        connection_type: type,
        mutual_connection_names: mutualNames
      };
    });

    console.log('Connection analysis completed');

    return new Response(JSON.stringify({ 
      success: true,
      analyses: connectionAnalyses
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-connections function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});