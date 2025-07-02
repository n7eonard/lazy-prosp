import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Prospect {
  id: string;
  name: string;
  title: string;
  company: string;
  location?: string;
  linkedin_url?: string;
  avatar_url?: string;
  mutual_connections: number;
  profile_data?: any;
  created_at: string;
}

export const useProspects = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load existing prospects
  useEffect(() => {
    if (user) {
      loadProspects();
    }
  }, [user]);

  const loadProspects = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProspects(data || []);
    } catch (error: any) {
      console.error('Error loading prospects:', error);
      toast({
        title: "Error Loading Prospects",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const scanLinkedInProspects = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in with LinkedIn to scan prospects",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setScanning(true);
      console.log('Starting prospect search...');
      
      // Call the new search-prospects edge function
      console.log('Calling search-prospects edge function...');
      const session = await supabase.auth.getSession();
      console.log('Session token:', session.data.session?.access_token ? 'Present' : 'Missing');
      
      const { data: searchData, error: searchError } = await supabase.functions.invoke(
        'search-prospects',
        {
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
        }
      );

      console.log('Search response:', searchData);
      console.log('Search error:', searchError);

      if (searchError) {
        console.error('Search error details:', searchError);
        throw new Error(`Prospect search failed: ${searchError.message}`);
      }

      if (!searchData?.success || !searchData?.prospects) {
        console.log('Debug - searchData structure:', JSON.stringify(searchData, null, 2));
        console.log('Debug - searchData.success:', searchData?.success);
        console.log('Debug - searchData.prospects:', searchData?.prospects);
        console.log('Debug - prospects length:', searchData?.prospects?.length);
        throw new Error('No prospects found from theorg.com');
      }

      console.log(`Found ${searchData.prospects.length} prospects from theorg.com`);

      // Clear existing prospects and insert new ones
      const { error: deleteError } = await supabase
        .from('prospects')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting existing prospects:', deleteError);
      }

      const { error: insertError } = await supabase
        .from('prospects')
        .insert(
          searchData.prospects.map((prospect: any) => ({
            ...prospect,
            user_id: user.id
          }))
        );

      if (insertError) throw insertError;

      toast({
        title: "Search Complete!",
        description: `Found ${searchData.prospects.length} product leaders in ${searchData.searchLocation}`,
      });

      // Reload prospects
      await loadProspects();
      
    } catch (error: any) {
      console.error('Error searching prospects:', error);
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search prospects",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  return {
    prospects,
    loading,
    scanning,
    scanLinkedInProspects,
    loadProspects
  };
};