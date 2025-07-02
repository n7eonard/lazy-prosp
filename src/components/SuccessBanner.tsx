import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessBannerProps {
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
  autoHideDelay?: number;
}

const SuccessBanner = ({ 
  message, 
  isVisible, 
  onDismiss, 
  autoHideDelay = 5000 
}: SuccessBannerProps) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldShow(true);
      
      // Auto-hide after delay
      const timer = setTimeout(() => {
        setShouldShow(false);
        setTimeout(onDismiss, 300); // Wait for animation to complete
      }, autoHideDelay);

      return () => clearTimeout(timer);
    } else {
      setShouldShow(false);
    }
  }, [isVisible, autoHideDelay, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 transform transition-all duration-300 ease-out",
      shouldShow 
        ? "translate-y-0 opacity-100" 
        : "-translate-y-full opacity-0"
    )}>
      <div className="bg-gradient-to-r from-success/90 to-success/80 backdrop-blur-sm border-b border-success/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-white" />
              <span className="text-white font-medium">{message}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-white hover:bg-white/10 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessBanner;