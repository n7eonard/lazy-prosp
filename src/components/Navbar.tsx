import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Search } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-30 p-8 lg:p-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Search className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">ProspectAgent</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <Button variant="ghost" size="sm" className="gap-2">
            <Users className="w-4 h-4" />
            Prospects
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Messages
          </Button>
          <Button variant="linkedin" size="sm" className="gap-2">
            <Users className="w-4 h-4" />
            Connect LinkedIn
          </Button>
        </div>
        
        <div className="md:hidden">
          <Button variant="ghost" size="icon">
            <Users className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;