import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Linkedin, Loader2, Target, Users, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LinkedInAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: () => void;
}

const LinkedInAuthModal = ({ open, onOpenChange, onAuthSuccess }: LinkedInAuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLinkedInAuth = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        throw error;
      }

      // The redirect will handle the rest
      onAuthSuccess();
      
    } catch (error: any) {
      console.error('LinkedIn auth error:', error);
      toast({
        title: "Authentication Failed",
        description: error.message || "Failed to authenticate with LinkedIn. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-card border-card-border">
        <DialogHeader className="text-center space-y-4">
          <DialogTitle className="text-2xl font-bold text-foreground">
            Connect with LinkedIn
          </DialogTitle>
          <p className="text-muted-foreground">
            Authenticate your LinkedIn account to start discovering prospects and analyzing connections
          </p>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Features Preview */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 bg-card border border-card-border rounded-lg">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Smart Discovery</p>
                <p className="text-xs text-muted-foreground">Find CPOs and VP Products</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-card border border-card-border rounded-lg">
              <div className="w-8 h-8 bg-linkedin/10 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-linkedin" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Connection Analysis</p>
                <p className="text-xs text-muted-foreground">Identify mutual connections</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-card border border-card-border rounded-lg">
              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Tailored Messages</p>
                <p className="text-xs text-muted-foreground">AI-generated intro messages</p>
              </div>
            </div>
          </div>
          
          {/* LinkedIn Auth Button */}
          <Button 
            onClick={handleLinkedInAuth}
            disabled={isLoading}
            variant="linkedin"
            size="lg"
            className="w-full gap-3 h-12 text-base font-semibold"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Linkedin className="w-5 h-5" />
            )}
            {isLoading ? 'Connecting...' : 'Continue with LinkedIn'}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            We'll only access your profile information and connections to find relevant prospects
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkedInAuthModal;