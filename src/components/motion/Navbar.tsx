import { ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
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

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="nav-link flex items-center gap-1 px-3 py-2">
                  Features
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/tasks')}>
                  AI Task Planner
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/projects')}>
                  AI Project Manager
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/calendar')}>
                  AI Calendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/meetings')}>
                  AI Meeting Notetaker
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/journal')}>
                  AI Docs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="nav-link flex items-center gap-1 px-3 py-2">
                  Use Cases
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => scrollToSection('testimonials')}>
                  For Individuals
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection('comparison')}>
                  For Teams
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection('features')}>
                  For Enterprises
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="nav-link flex items-center gap-1 px-3 py-2">
                  Resources
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => scrollToSection('features')}>
                  Blog
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  Help Center
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection('features')}>
                  API Docs
                </DropdownMenuItem>
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

          {/* CTA Button */}
          <Button 
            className="cta-button hidden md:inline-flex"
            onClick={() => navigate('/auth')}
          >
            Try Aura Lift for free
          </Button>

          {/* Mobile menu button */}
          <Button variant="ghost" className="md:hidden" size="icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>
    </nav>
  );
}
