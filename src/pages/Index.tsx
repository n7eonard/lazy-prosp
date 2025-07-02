import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProspectCard from "@/components/ProspectCard";
import MessageComposer from "@/components/MessageComposer";
import { Button } from "@/components/ui/button";
import { Search, Filter, Users, Loader2 } from "lucide-react";
import { useProspects } from "@/hooks/useProspects";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { prospects, loading, scanning } = useProspects();
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
              Discovered Prospects
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {user 
                ? "AI-powered analysis of LinkedIn profiles with connection insights"
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
              <h3 className="text-lg font-semibold mb-2">Scanning LinkedIn Profiles</h3>
              <p className="text-muted-foreground">
                Finding CPOs and VP Products in your network...
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
                  />
                ))}
              </div>
              
              {/* Message Composer */}
              <div className="max-w-2xl mx-auto">
                <MessageComposer prospectName={prospects[0]?.name || "prospect"} />
              </div>
            </>
          )}
          
          {/* Empty State */}
          {!scanning && !loading && prospects.length === 0 && user && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Prospects Found</h3>
              <p className="text-muted-foreground mb-6">
                Start a scan to discover CPOs and VP Products in your network
              </p>
              <Button variant="default" className="gap-2">
                <Search className="w-4 h-4" />
                Start Scanning
              </Button>
            </div>
          )}
          
          {/* Not Authenticated State */}
          {!user && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Connect Your LinkedIn</h3>
              <p className="text-muted-foreground">
                Authenticate with LinkedIn to start discovering prospects
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
