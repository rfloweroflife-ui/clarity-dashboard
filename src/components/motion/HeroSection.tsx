import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function HeroSection() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        // Only update when hero is visible
        if (rect.bottom > 0) {
          setScrollY(window.scrollY);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={heroRef} className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Parallax Background Layers */}
      <div className="absolute inset-0 gradient-bg" />
      
      {/* Floating orbs with parallax */}
      <div 
        className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-primary/10 blur-3xl"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      />
      <div 
        className="absolute top-40 right-[15%] w-96 h-96 rounded-full bg-brand-pink/10 blur-3xl"
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      />
      <div 
        className="absolute bottom-0 left-[30%] w-80 h-80 rounded-full bg-brand-blue/10 blur-3xl"
        style={{ transform: `translateY(${scrollY * -0.15}px)` }}
      />

      {/* Floating geometric shapes */}
      <div 
        className="absolute top-32 left-[5%] w-4 h-4 rounded-full bg-primary/40 animate-pulse"
        style={{ transform: `translateY(${scrollY * 0.5}px) rotate(${scrollY * 0.1}deg)` }}
      />
      <div 
        className="absolute top-48 right-[8%] w-3 h-3 rounded-sm bg-brand-pink/40 rotate-45"
        style={{ transform: `translateY(${scrollY * 0.4}px) rotate(${45 + scrollY * 0.2}deg)` }}
      />
      <div 
        className="absolute top-64 left-[15%] w-2 h-2 rounded-full bg-brand-blue/50"
        style={{ transform: `translateY(${scrollY * 0.6}px)` }}
      />
      <div 
        className="absolute top-80 right-[20%] w-5 h-5 rounded-full border-2 border-primary/30"
        style={{ transform: `translateY(${scrollY * 0.35}px) scale(${1 + scrollY * 0.001})` }}
      />
      <div 
        className="absolute bottom-32 left-[25%] w-3 h-3 rounded-sm bg-success/30 rotate-12"
        style={{ transform: `translateY(${scrollY * -0.25}px) rotate(${12 + scrollY * 0.15}deg)` }}
      />
      <div 
        className="absolute bottom-48 right-[12%] w-4 h-4 rounded-full border border-brand-pink/40"
        style={{ transform: `translateY(${scrollY * -0.3}px)` }}
      />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          transform: `translateY(${scrollY * 0.1}px)`,
        }}
      />

      {/* Main Content */}
      <div className="relative max-w-5xl mx-auto text-center z-10">
        {/* Badge */}
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border mb-8 fade-in-up backdrop-blur-sm"
          style={{ transform: `translateY(${scrollY * -0.05}px)` }}
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Voted #1 hottest product by</span>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">A</span>
            </div>
            <span className="font-semibold text-foreground text-sm">Amplitude</span>
          </div>
        </div>

        {/* Main Headline with subtle parallax */}
        <div style={{ transform: `translateY(${scrollY * -0.08}px)` }}>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
            Get an unfair advantage by using AI to{' '}
            <span className="gradient-text relative">
              double productivity
              {/* Animated underline */}
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-brand-pink to-primary rounded-full opacity-50" />
            </span>
          </h1>
        </div>

        {/* Subheadline */}
        <p 
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 fade-in-up" 
          style={{ 
            animationDelay: '0.2s',
            transform: `translateY(${scrollY * -0.06}px)` 
          }}
        >
          The <span className="font-semibold text-foreground">#1 Rated Productivity Platform</span> for the AI Era. AI Projects, AI Tasks, AI Calendar, AI Meetings, AI Docs, AI Notes, AI Reports, AI Workflows, and more.
        </p>

        {/* CTA */}
        <div 
          className="fade-in-up" 
          style={{ 
            animationDelay: '0.3s',
            transform: `translateY(${scrollY * -0.04}px)` 
          }}
        >
          <Button 
            className="cta-button text-lg px-8 py-6 h-auto group relative overflow-hidden"
            onClick={() => navigate('/auth')}
          >
            <span className="relative z-10">Try Aura Lift for free</span>
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-brand-pink to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Start your free trial. Cancel in 1 click.
          </p>
        </div>

        {/* Scroll indicator */}
        <div 
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60"
          style={{ 
            opacity: Math.max(0, 0.6 - scrollY * 0.005),
            transform: `translateY(${scrollY * 0.2}px)` 
          }}
        >
          <span className="text-xs text-muted-foreground">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 rounded-full bg-muted-foreground/50 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
