import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MessagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  title: string;
  company: string;
  location: string;
  workEmail?: string;
  startDate?: string;
}

const generateAIIntroMessage = async ({ name, title, company, location, workEmail, startDate }: {
  name: string;
  title: string;
  company: string;
  location: string;
  workEmail?: string;
  startDate?: string;
}) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-intro-message', {
      body: {
        name,
        title,
        company,
        location,
        workEmail,
        startDate
      }
    });

    if (error) throw error;
    return data.message;
  } catch (error) {
    console.error('Error generating AI message:', error);
    // Fallback to basic message
    const firstName = name.split(' ')[0];
    return `Hi ${firstName}! I help product leaders scale their teams and optimize strategy. Would love to connect and learn about ${company}'s product initiatives.`;
  }
};

export const MessagePopup = ({ isOpen, onClose, name, title, company, location, workEmail, startDate }: MessagePopupProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setDisplayedText("");
      setIsStreaming(false);
      setIsGenerating(true);

      // Generate AI message
      generateAIIntroMessage({
        name,
        title,
        company,
        location,
        workEmail,
        startDate
      }).then((fullMessage) => {
        setIsGenerating(false);
        setIsStreaming(true);

        // Stream the text character by character
        let currentIndex = 0;
        const streamInterval = setInterval(() => {
          if (currentIndex < fullMessage.length) {
            setDisplayedText(prev => prev + fullMessage[currentIndex]);
            currentIndex++;
          } else {
            setIsStreaming(false);
            clearInterval(streamInterval);
          }
        }, 30);

        return () => clearInterval(streamInterval);
      }).catch(() => {
        setIsGenerating(false);
        setDisplayedText("Sorry, I couldn't generate a personalized message at the moment. Please try again.");
      });
    }
  }, [isOpen, name, title, company, location, workEmail, startDate]);

  const copyToClipboard = () => {
    if (displayedText) {
      navigator.clipboard.writeText(displayedText);
      toast({
        title: "Message copied!",
        description: "LinkedIn intro message copied to clipboard.",
      });
      // Close the popup after copying
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Post-it Note */}
      <div className="relative bg-yellow-200 p-6 max-w-md mx-4 rounded-sm shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300">
        {/* Post-it tape effect */}
        <div className="absolute -top-3 left-8 w-16 h-6 bg-yellow-300/60 rounded-sm transform -rotate-12"></div>
        
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Content */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 font-handwriting">
            LinkedIn Intro Message
          </h3>
          
          <div className="bg-yellow-100 p-3 rounded border-l-4 border-yellow-600 min-h-32">
            <p className="text-gray-800 text-sm leading-relaxed font-handwriting whitespace-pre-wrap">
              {isGenerating ? (
                <span className="text-gray-600 italic">Researching company news and crafting personalized message...</span>
              ) : (
                <>
                  {displayedText}
                  {isStreaming && <span className="animate-pulse">|</span>}
                </>
              )}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{displayedText.length}/300 characters</span>
            {!isStreaming && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-2 bg-yellow-50 border-yellow-400 text-gray-700 hover:bg-yellow-100"
              >
                <Copy className="w-3 h-3" />
                Copy
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};