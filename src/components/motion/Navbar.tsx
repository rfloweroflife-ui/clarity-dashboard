import { useState } from "react";
import { ChevronDown, X, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const features = [
  { label: "AI Task Planner", route: "/tasks" },
  { label: "AI Project Manager", route: "/projects" },
  { label: "AI Calendar", route: "/calendar" },
  { label: "AI Meeting Notetaker", route: "/meetings" },
  { label: "AI Docs", route: "/journal" },
];

const useCases = [
  { label: "For Individuals", section: "testimonials" },
  { label: "For Teams", section: "comparison" },
  { label: "For Enterprises", section: "features" },
];

const resources = [
  { label: "Blog", section: "features" },
  { label: "Help Center", route: "/settings" },
  { label: "API Docs", section: "features" },
];

export function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleNavigate = (route: string) => {
    navigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">Aura Lift</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="nav-link flex items-center gap-1 px-3 py-2">
                    Features
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-popover border-border">
                  {features.map((item) => (
                    <DropdownMenuItem key={item.label} onClick={() => navigate(item.route)}>
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="nav-link flex items-center gap-1 px-3 py-2">
                    Use Cases
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-popover border-border">
                  {useCases.map((item) => (
                    <DropdownMenuItem key={item.label} onClick={() => scrollToSection(item.section)}>
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="nav-link flex items-center gap-1 px-3 py-2">
                    Resources
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-popover border-border">
                  {resources.map((item) => (
                    <DropdownMenuItem 
                      key={item.label} 
                      onClick={() => item.route ? navigate(item.route) : scrollToSection(item.section!)}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <button 
                onClick={() => scrollToSection('comparison')} 
                className="nav-link px-3 py-2"
              >
                Pricing
              </button>
              <Link to="/auth" className="nav-link px-3 py-2">
                Login
              </Link>
            </div>

            {/* Desktop CTA Button */}
            <Button 
              className="cta-button hidden md:inline-flex"
              onClick={() => navigate('/auth')}
            >
              Try Aura Lift for free
            </Button>

            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              className="md:hidden" 
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div 
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-background border-l border-border shadow-xl transition-transform duration-300 ease-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="font-display font-bold text-lg text-foreground">Menu</span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Features Section */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Features
              </h3>
              <div className="space-y-1">
                {features.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item.route)}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Use Cases Section */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Use Cases
              </h3>
              <div className="space-y-1">
                {useCases.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => scrollToSection(item.section)}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors animate-fade-in"
                    style={{ animationDelay: `${(features.length + index) * 50}ms` }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resources Section */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Resources
              </h3>
              <div className="space-y-1">
                {resources.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => item.route ? handleNavigate(item.route) : scrollToSection(item.section!)}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors animate-fade-in"
                    style={{ animationDelay: `${(features.length + useCases.length + index) * 50}ms` }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="border-t border-border pt-4">
              <button
                onClick={() => scrollToSection('comparison')}
                className="w-full text-left px-3 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => handleNavigate('/auth')}
                className="w-full text-left px-3 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Login
              </button>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-4 border-t border-border">
            <Button 
              className="cta-button w-full"
              onClick={() => handleNavigate('/auth')}
            >
              Try Aura Lift for free
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Start your free trial
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
