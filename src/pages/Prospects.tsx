import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Building2, MapPin, Users, MessageSquare, ExternalLink, Mail, Calendar, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessagePopup } from "@/components/MessagePopup";
import Navbar from "@/components/Navbar";

interface SavedProspect {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string | null;
  mutual_connections: number | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  profile_data: any | null;
  created_at: string;
}

const Prospects = () => {
  const [prospects, setProspects] = useState<SavedProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<SavedProspect | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSavedProspects();
    }
  }, [user]);

  const fetchSavedProspects = async () => {
    try {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProspects(data || []);
    } catch (error) {
      console.error('Error fetching prospects:', error);
      toast({
        title: "Failed to load prospects",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProspect = async (prospectId: string) => {
    try {
      const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', prospectId);

      if (error) throw error;

      setProspects(prospects.filter(p => p.id !== prospectId));
      toast({
        title: "Prospect removed",
        description: "The prospect has been deleted from your list.",
      });
    } catch (error) {
      console.error('Error deleting prospect:', error);
      toast({
        title: "Failed to delete prospect",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const openMessagePopup = (prospect: SavedProspect) => {
    setSelectedProspect(prospect);
    setShowMessagePopup(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="bg-gradient-card border-card-border p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to view your saved prospects.</p>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your prospects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="py-20 px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Saved Prospects</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Manage and connect with your saved product leaders
            </p>
          </div>

          {prospects.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No saved prospects yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by searching for prospects and saving them to your list.
              </p>
              <Button variant="hero" onClick={() => window.location.href = '/'}>
                Search Prospects
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {prospects.map((prospect) => (
                <Card key={prospect.id} className="bg-gradient-card border-card-border p-6 shadow-card hover:shadow-glow transition-smooth group">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="w-16 h-16">
                        <AvatarImage 
                          src={prospect.avatar_url || `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=face`} 
                          alt={prospect.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          {prospect.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground truncate">{prospect.name}</h3>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="opacity-0 group-hover:opacity-100 transition-smooth text-red-500 hover:text-red-600"
                            onClick={() => deleteProspect(prospect.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="opacity-0 group-hover:opacity-100 transition-smooth"
                            onClick={() => prospect.linkedin_url && window.open(prospect.linkedin_url, '_blank')}
                            disabled={!prospect.linkedin_url}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-1">{prospect.title}</p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Building2 className="w-3 h-3" />
                        <span>{prospect.company}</span>
                        <span>•</span>
                        <MapPin className="w-3 h-3" />
                        <span>{prospect.location}</span>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="space-y-1 mb-3">
                        {prospect.profile_data?.work_email && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            <span>{prospect.profile_data.work_email}</span>
                          </div>
                        )}
                        {prospect.profile_data?.start_date && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>Started {new Date(prospect.profile_data.start_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Connection Info */}
                      {prospect.mutual_connections && prospect.mutual_connections > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="secondary" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {prospect.mutual_connections} mutual connection{prospect.mutual_connections > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-2"
                          onClick={() => openMessagePopup(prospect)}
                        >
                          <MessageSquare className="w-4 h-4" />
                          Write intro message
                        </Button>
                        <Button variant="linkedin" size="sm">
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedProspect && (
        <MessagePopup
          isOpen={showMessagePopup}
          onClose={() => {
            setShowMessagePopup(false);
            setSelectedProspect(null);
          }}
          name={selectedProspect.name}
          title={selectedProspect.title}
          company={selectedProspect.company}
          location={selectedProspect.location || ""}
          workEmail={selectedProspect.profile_data?.work_email}
          startDate={selectedProspect.profile_data?.start_date}
          countryCode="US" // Default fallback since saved prospects might not have this
        />
      )}
    </div>
  );
};

export default Prospects;