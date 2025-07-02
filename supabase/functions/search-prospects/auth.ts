import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

export const authenticateUser = async (req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
  
  if (authError || !user) {
    console.error('Authentication error:', authError);
    throw new Error('Unauthorized');
  }

  console.log('Authenticated user:', user.id);
  return user;
};