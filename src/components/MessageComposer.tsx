import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wand2, Copy, RefreshCw } from "lucide-react";

interface MessageComposerProps {
  prospectName?: string;
  onGenerate?: (message: string) => void;
}

const MessageComposer = ({ prospectName = "John", onGenerate }: MessageComposerProps) => {
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const maxLength = 300;
  const remainingChars = maxLength - message.length;
  
  const generateMessage = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const generatedMessage = `Hi ${prospectName}, hope you're doing well!\n\nI'm relocating to Barcelona this summer and I work with product teams on scaling challenges and new product launches.\n\nGreat to connect — happy to have a chat whenever the timing feels right.\n\nNicolas`;
      setMessage(generatedMessage);
      setIsGenerating(false);
      onGenerate?.(generatedMessage);
    }, 2000);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
  };

  return (
    <Card className="bg-gradient-card border-card-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Message Composer</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateMessage}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
          {message && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={copyToClipboard}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="Your personalized LinkedIn intro message will appear here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-32 resize-none bg-input border-card-border focus:ring-primary"
            maxLength={maxLength}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <Badge 
              variant={remainingChars < 50 ? "destructive" : remainingChars < 100 ? "secondary" : "outline"}
              className="text-xs"
            >
              {remainingChars}/{maxLength}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            Tone: Professional & Friendly
          </Badge>
          <Badge variant="outline" className="text-xs">
            Focus: Product Scaling
          </Badge>
          <Badge variant="outline" className="text-xs">
            Location: Barcelona
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default MessageComposer;