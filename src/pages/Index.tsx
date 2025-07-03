import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProspectCard from "@/components/ProspectCard";
import MessageComposer from "@/components/MessageComposer";
import LinkedInAuthModal from "@/components/LinkedInAuthModal";
import { Button } from "@/components/ui/button";
import { Search, Filter, Users, Loader2 } from "lucide-react";
import { useProspects } from "@/hooks/useProspects";
import { useAuth } from "@/hooks/useAuth";
import { CountrySelector } from "@/components/CountrySelector";

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { prospects, loading, scanning, selectedCountry, setSelectedCountry, scanLinkedInProspects, clearResults } = useProspects();
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Prospects Section */}
      <section id="prospects-section" className="py-20 px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {prospects.length > 0 ? "Meet your next clients" : "Let's scan your Product sphere"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {user 
                ? prospects.length > 0 
                  ? "AI-powered analysis of LinkedIn profiles with connection insights"
                  : "Choose a country and start discovering product leaders"
                : "Connect your LinkedIn account to start discovering prospects"
              }
            </p>
          </div>
          
          {/* Filters */}
          {prospects.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-8 justify-between items-center">
              <div className="flex gap-4">
                <Button variant="outline" className="gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </Button>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
                <Button variant="outline" className="gap-2" onClick={clearResults}>
                  New Search
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                {prospects.length} prospects found
              </div>
            </div>
          )}
          
          {/* Loading State */}
          {scanning && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Searching Product Leaders</h3>
              <p className="text-muted-foreground">
                Finding CPOs and VP Products using theorg.com database...
              </p>
            </div>
          )}
          
          {/* Prospects Grid */}
          {!scanning && prospects.length > 0 && (
            <>
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                {prospects.map((prospect) => (
                  <ProspectCard 
                    key={prospect.id} 
                    name={prospect.name}
                    title={prospect.title}
                    company={prospect.company}
                    location={prospect.location || ""}
                    mutualConnections={prospect.mutual_connections}
                    avatar={prospect.avatar_url || ""}
                    linkedinUrl={prospect.linkedin_url || ""}
                    workEmail={prospect.profile_data?.work_email}
                    startDate={prospect.profile_data?.start_date}
                  />
                ))}
              </div>
              
              {/* Message Composer */}
              <div className="max-w-2xl mx-auto">
                <MessageComposer prospectName={prospects[0]?.name || "prospect"} />
              </div>
            </>
          )}
          
          {/* Country Selection */}
          {!scanning && user && prospects.length === 0 && (
            <CountrySelector 
              selectedCountry={selectedCountry}
              onCountrySelect={setSelectedCountry}
            />
          )}

          {/* Search Button */}
          {!scanning && user && prospects.length === 0 && selectedCountry && (
            <div className="text-center py-8">
              <Button 
                variant="default" 
                className="gap-2" 
                onClick={() => scanLinkedInProspects()}
              >
                <Search className="w-4 h-4" />
                Search Prospects in {selectedCountry}
              </Button>
            </div>
          )}

          {/* Empty State - No Country Selected */}
          {!scanning && !loading && prospects.length === 0 && user && !selectedCountry && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Select a Country</h3>
              <p className="text-muted-foreground">
                Choose a country above to start discovering product leaders
              </p>
            </div>
          )}
          
          {/* Not Authenticated State */}
          {!user && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Connect Your LinkedIn</h3>
              <Button 
                variant="hero" 
                size="lg" 
                className="gap-2 mb-4"
                onClick={() => setShowAuthModal(true)}
              >
                <Users className="w-4 h-4" />
                Get started
              </Button>
              <p className="text-muted-foreground">
                Authenticate with LinkedIn to start discovering prospects
              </p>
            </div>
          )}
        </div>
      </section>
      
      <LinkedInAuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onAuthSuccess={() => {
          setShowAuthModal(false);
          setTimeout(() => {
            document.getElementById('prospects-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 1000);
        }}
      />
    </div>
  );
};

export default Index;
