import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Building2, MapPin, Users, MessageSquare, ExternalLink, Mail, Calendar } from "lucide-react";

const generateIntroMessage = ({ name, title, company, location, workEmail, startDate }: {
  name: string;
  title: string;
  company: string;
  location: string;
  workEmail?: string;
  startDate?: string;
}) => {
  const firstName = name.split(' ')[0];
  const companyName = company;
  const jobTitle = title;
  
  // Calculate tenure if startDate is available
  let tenureText = '';
  if (startDate) {
    const start = new Date(startDate);
    const now = new Date();
    const monthsDiff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (monthsDiff >= 12) {
      const years = Math.floor(monthsDiff / 12);
      tenureText = years === 1 ? ' over the past year' : ` over the past ${years} years`;
    } else if (monthsDiff > 0) {
      tenureText = ' recently';
    }
  }
  
  // Generate personalized message within 300 character limit
  const messages = [
    `Hi ${firstName}! I help product leaders scale their teams and optimize product strategy. Would love to connect and learn about ${companyName}'s product initiatives${tenureText}.`,
    
    `Hello ${firstName}, I work with ${jobTitle}s on product scaling challenges. Impressed by what you're building at ${companyName}${tenureText}. Happy to exchange insights!`,
    
    `Hi ${firstName}! I specialize in helping product teams overcome scaling challenges. Would love to connect and hear about your experience as ${jobTitle} at ${companyName}.`
  ];
  
  // Pick the shortest message that fits under 300 characters
  const selectedMessage = messages.find(msg => msg.length <= 300) || messages[0].substring(0, 297) + '...';
  
  return selectedMessage;
};

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
  startDate
}: ProspectCardProps) => {
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
              onClick={() => {
                const message = generateIntroMessage({
                  name,
                  title,
                  company,
                  location,
                  workEmail,
                  startDate
                });
                navigator.clipboard.writeText(message);
                // You could add a toast notification here
              }}
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
  );
};

export default ProspectCard;