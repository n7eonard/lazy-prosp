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
      
      // Simulate LinkedIn API scanning for CPOs and VP Products
      // In a real implementation, this would call LinkedIn API or theorg.com scraping service
      const mockProspects = [
        {
          name: "Sarah Chen",
          title: "Chief Product Officer",
          company: "TechFlow",
          location: "Barcelona, Spain",
          avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face",
          mutual_connections: 3,
          linkedin_url: "https://linkedin.com/in/sarah-chen-cpo",
          profile_data: {
            experience: "10+ years in product management",
            industry: "SaaS",
            company_size: "500-1000"
          }
        },
        {
          name: "Marcus Rodriguez",
          title: "VP of Product",
          company: "InnovateCorp",
          location: "Madrid, Spain",
          avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          mutual_connections: 1,
          linkedin_url: "https://linkedin.com/in/marcus-rodriguez-vp",
          profile_data: {
            experience: "8+ years in product strategy",
            industry: "Fintech",
            company_size: "200-500"
          }
        },
        {
          name: "Elena Volkov",
          title: "Chief Product Officer",
          company: "ScaleUp Solutions",
          location: "Valencia, Spain",
          avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
          mutual_connections: 0,
          linkedin_url: "https://linkedin.com/in/elena-volkov-cpo",
          profile_data: {
            experience: "12+ years in product leadership",
            industry: "E-commerce",
            company_size: "100-200"
          }
        },
        {
          name: "James Thompson",
          title: "VP Product Strategy",
          company: "DataDriven Inc",
          location: "Barcelona, Spain",
          avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          mutual_connections: 2,
          linkedin_url: "https://linkedin.com/in/james-thompson-vp",
          profile_data: {
            experience: "9+ years in product analytics",
            industry: "Data Analytics",
            company_size: "50-100"
          }
        },
        {
          name: "Ana Gutierrez",
          title: "Chief Product Officer",
          company: "CloudNative Labs",
          location: "Madrid, Spain",
          avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
          mutual_connections: 4,
          linkedin_url: "https://linkedin.com/in/ana-gutierrez-cpo",
          profile_data: {
            experience: "11+ years in cloud products",
            industry: "Cloud Infrastructure",
            company_size: "1000+"
          }
        }
      ];

      // Clear existing prospects
      await supabase
        .from('prospects')
        .delete()
        .eq('user_id', user.id);

      // Insert new prospects
      const { error } = await supabase
        .from('prospects')
        .insert(
          mockProspects.map(prospect => ({
            ...prospect,
            user_id: user.id
          }))
        );

      if (error) throw error;

      toast({
        title: "Scan Complete!",
        description: `Found ${mockProspects.length} relevant prospects`,
      });

      // Reload prospects
      await loadProspects();
      
    } catch (error: any) {
      console.error('Error scanning prospects:', error);
      toast({
        title: "Scan Failed",
        description: error.message,
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