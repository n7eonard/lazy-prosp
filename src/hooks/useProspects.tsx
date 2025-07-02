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
    if (!user) return;
    
    try {
      setScanning(true);
      
      // Step 1: Scrape theorg.com for CPOs and VP Products
      console.log('Starting theorg.com scraping...');
      const { data: scrapingData, error: scrapingError } = await supabase.functions.invoke(
        'scrape-theorg',
        {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );

      if (scrapingError) {
        throw new Error(`Scraping failed: ${scrapingError.message}`);
      }

      if (!scrapingData?.success || !scrapingData?.profiles) {
        throw new Error('No profiles found from theorg.com');
      }

      console.log(`Found ${scrapingData.profiles.length} profiles from theorg.com`);

      // Step 2: Analyze LinkedIn connections for each profile
      console.log('Analyzing LinkedIn connections...');
      const linkedinUrls = scrapingData.profiles
        .map((profile: any) => profile.linkedin_url)
        .filter(Boolean);

      const { data: connectionData, error: connectionError } = await supabase.functions.invoke(
        'analyze-connections',
        {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: {
            linkedin_urls: linkedinUrls
          }
        }
      );

      if (connectionError) {
        console.warn('Connection analysis failed:', connectionError.message);
        // Continue without connection data
      }

      // Step 3: Combine profile data with connection analysis
      const enrichedProspects = scrapingData.profiles.map((profile: any) => {
        const connectionAnalysis = connectionData?.analyses?.find(
          (analysis: any) => analysis.linkedin_url === profile.linkedin_url
        );

        return {
          name: profile.name,
          title: profile.title,
          company: profile.company,
          location: profile.location || "",
          avatar_url: profile.avatar_url,
          linkedin_url: profile.linkedin_url,
          mutual_connections: connectionAnalysis?.mutual_connections || 0,
          profile_data: {
            connection_type: connectionAnalysis?.connection_type || 'none',
            mutual_connection_names: connectionAnalysis?.mutual_connection_names || [],
            industry: profile.company, // Use company as industry for now
            experience: `${profile.title} at ${profile.company}`
          }
        };
      });

      // Step 4: Clear existing prospects and insert new ones
      await supabase
        .from('prospects')
        .delete()
        .eq('user_id', user.id);

      const { error: insertError } = await supabase
        .from('prospects')
        .insert(
          enrichedProspects.map(prospect => ({
            ...prospect,
            user_id: user.id
          }))
        );

      if (insertError) throw insertError;

      toast({
        title: "Scan Complete!",
        description: `Found ${enrichedProspects.length} relevant prospects with connection analysis`,
      });

      // Reload prospects
      await loadProspects();
      
    } catch (error: any) {
      console.error('Error scanning prospects:', error);
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to scan prospects",
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