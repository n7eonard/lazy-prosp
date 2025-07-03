import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Building2, MapPin, Users, MessageSquare, ExternalLink, Mail, Calendar } from "lucide-react";
import { MessagePopup } from "@/components/MessagePopup";


interface ProspectCardProps {
  name: string;
  title: string;
  company: string;
  location: string;
  mutualConnections: number;
  avatar: string;
  companyLogo?: string;
  linkedinUrl?: string;
  workEmail?: string;
  startDate?: string;
  countryCode?: string;
}

const ProspectCard = ({ 
  name, 
  title, 
  company, 
  location, 
  mutualConnections, 
  avatar,
  companyLogo,
  linkedinUrl,
  workEmail,
  startDate,
  countryCode
}: ProspectCardProps) => {
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  return (
    <Card className="bg-gradient-card border-card-border p-6 shadow-card hover:shadow-glow transition-smooth group">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="w-16 h-16">
            <AvatarImage 
              src={avatar || `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=face`} 
              alt={name}
              className="object-cover"
            />
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              {name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {companyLogo && (
            <img 
              src={companyLogo}
              alt={company}
              className="absolute -bottom-2 -right-2 w-6 h-6 rounded border border-card-border bg-card"
            />
          )}
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-foreground truncate">{name}</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="opacity-0 group-hover:opacity-100 transition-smooth"
              onClick={() => linkedinUrl && window.open(linkedinUrl, '_blank')}
              disabled={!linkedinUrl}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Building2 className="w-3 h-3" />
            <span>{company}</span>
            <span>•</span>
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </div>
          
          {/* Additional Info */}
          <div className="space-y-1 mb-3">
            {workEmail && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="w-3 h-3" />
                <span>{workEmail}</span>
              </div>
            )}
            {startDate && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Started {new Date(startDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          {/* Connection Info */}
          {mutualConnections > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {mutualConnections} mutual connection{mutualConnections > 1 ? 's' : ''}
              </Badge>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={() => setShowMessagePopup(true)}
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
      
      <MessagePopup
        isOpen={showMessagePopup}
        onClose={() => setShowMessagePopup(false)}
        name={name}
        title={title}
        company={company}
        location={location}
        workEmail={workEmail}
        startDate={startDate}
        countryCode={countryCode}
      />
    </Card>
  );
};

export default ProspectCard;