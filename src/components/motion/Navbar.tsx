import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">Aura Lift</span>
          </div>

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
                <DropdownMenuItem>AI Task Planner</DropdownMenuItem>
                <DropdownMenuItem>AI Project Manager</DropdownMenuItem>
                <DropdownMenuItem>AI Calendar</DropdownMenuItem>
                <DropdownMenuItem>AI Meeting Notetaker</DropdownMenuItem>
                <DropdownMenuItem>AI Docs</DropdownMenuItem>
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
                <DropdownMenuItem>For Individuals</DropdownMenuItem>
                <DropdownMenuItem>For Teams</DropdownMenuItem>
                <DropdownMenuItem>For Enterprises</DropdownMenuItem>
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
                <DropdownMenuItem>Blog</DropdownMenuItem>
                <DropdownMenuItem>Help Center</DropdownMenuItem>
                <DropdownMenuItem>API Docs</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a href="#" className="nav-link px-3 py-2">Pricing</a>
            <a href="#" className="nav-link px-3 py-2">Login</a>
          </div>

          {/* CTA Button */}
          <Button className="cta-button hidden md:inline-flex">
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