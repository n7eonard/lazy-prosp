import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Zap, MessageCircle } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-hero relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(259_94%_51%_/_0.05),_transparent_70%)]" />
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/5 rounded-full blur-xl" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-linkedin/5 rounded-full blur-2xl" />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-8">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-card-border rounded-full text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            AI-Powered LinkedIn Prospecting
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Find Your Next
          <br />
          <span className="text-foreground">
            Product Gig
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Automatically discover Chief Product Officers and VP Products from theorg.com, 
          analyze mutual connections, and craft perfect intro messages.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button variant="hero" size="lg" className="gap-2">
            Start Prospecting
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg" className="gap-2">
            <Target className="w-5 h-5" />
            View Demo
          </Button>
        </div>
        
        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-gradient-card border border-card-border rounded-xl p-6 shadow-card hover:shadow-glow transition-smooth">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Discovery</h3>
            <p className="text-muted-foreground text-sm">
              AI-powered scraping of theorg.com to find relevant CPOs and VP Products
            </p>
          </div>
          
          <div className="bg-gradient-card border border-card-border rounded-xl p-6 shadow-card hover:shadow-glow transition-smooth">
            <div className="w-12 h-12 bg-linkedin/10 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-linkedin" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Connection Analysis</h3>
            <p className="text-muted-foreground text-sm">
              Identify mutual connections and 2nd degree contacts for warm introductions
            </p>
          </div>
          
          <div className="bg-gradient-card border border-card-border rounded-xl p-6 shadow-card hover:shadow-glow transition-smooth">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Tailored Messages</h3>
            <p className="text-muted-foreground text-sm">
              Generate personalized intro messages within LinkedIn's 300-character limit
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;