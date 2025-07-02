import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProspectCard from "@/components/ProspectCard";
import MessageComposer from "@/components/MessageComposer";
import { Button } from "@/components/ui/button";
import { Search, Filter, Users } from "lucide-react";

const mockProspects = [
  {
    name: "Sarah Chen",
    title: "Chief Product Officer",
    company: "TechFlow",
    location: "Barcelona, Spain",
    mutualConnections: 3,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Marcus Rodriguez",
    title: "VP of Product",
    company: "InnovateCorp",
    location: "Madrid, Spain",
    mutualConnections: 1,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Elena Volkov",
    title: "Chief Product Officer",
    company: "ScaleUp Solutions",
    location: "Valencia, Spain",
    mutualConnections: 0,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Prospects Section */}
      <section className="py-20 px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Discovered Prospects
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI-powered analysis of theorg.com profiles with connection insights
            </p>
          </div>
          
          {/* Filters */}
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
              {mockProspects.length} prospects found
            </div>
          </div>
          
          {/* Prospects Grid */}
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            {mockProspects.map((prospect, index) => (
              <ProspectCard key={index} {...prospect} />
            ))}
          </div>
          
          {/* Message Composer */}
          <div className="max-w-2xl mx-auto">
            <MessageComposer prospectName="Sarah" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
