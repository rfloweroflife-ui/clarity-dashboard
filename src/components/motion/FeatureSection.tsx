import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight } from "lucide-react";

// Import feature images
import featureTasksImg from "@/assets/feature-tasks.jpg";
import featureProjectsImg from "@/assets/feature-projects.jpg";
import featureMeetingsImg from "@/assets/feature-meetings.jpg";

interface Feature {
  id: string;
  title: string;
  description: string;
  image?: string;
}

interface FeatureSectionProps {
  title: string;
  features: Feature[];
}

// Map section titles to images
const sectionImages: Record<string, string> = {
  "AI Task Planner": featureTasksImg,
  "AI Project Manager": featureProjectsImg,
  "AI Meeting Notetaker": featureMeetingsImg,
};

export function FeatureSection({ title, features }: FeatureSectionProps) {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(features[0].id);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const currentFeature = features.find(f => f.id === activeFeature);
  const sectionImage = sectionImages[title] || featureTasksImg;

  // Determine the route based on the section title
  const getRouteForSection = (sectionTitle: string) => {
    if (sectionTitle.includes("Task")) return "/tasks";
    if (sectionTitle.includes("Project")) return "/projects";
    if (sectionTitle.includes("Meeting")) return "/meetings";
    return "/dashboard";
  };

  const sectionRoute = getRouteForSection(title);

  // Handle feature change with animation
  const handleFeatureChange = (featureId: string) => {
    if (featureId === activeFeature) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setActiveFeature(featureId);
      setIsAnimating(false);
    }, 150);
  };

  // Auto-cycle through features
  useEffect(() => {
    const interval = setInterval(() => {
      const currentIndex = features.findIndex(f => f.id === activeFeature);
      const nextIndex = (currentIndex + 1) % features.length;
      handleFeatureChange(features[nextIndex].id);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeFeature, features]);

  return (
    <section id="features" className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12">
          {title}
        </h2>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Feature list */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => handleFeatureChange(feature.id)}
                className={cn(
                  "w-full text-left p-6 rounded-xl border transition-all duration-300 group relative overflow-hidden",
                  activeFeature === feature.id
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-border hover:border-primary/20"
                )}
              >
                {/* Progress indicator for active feature */}
                {activeFeature === feature.id && (
                  <div className="absolute bottom-0 left-0 h-0.5 bg-primary animate-[progress_5s_linear]" 
                       style={{ width: '100%' }} />
                )}
                
                <div className="flex items-start gap-4">
                  <span className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                    activeFeature === feature.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground group-hover:bg-primary/20"
                  )}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className={cn(
                      "font-display text-lg font-semibold mb-2 transition-colors",
                      activeFeature === feature.id ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {feature.title}
                    </h3>
                    <div className={cn(
                      "grid transition-all duration-300",
                      activeFeature === feature.id 
                        ? "grid-rows-[1fr] opacity-100" 
                        : "grid-rows-[0fr] opacity-0"
                    )}>
                      <div className="overflow-hidden">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Feature preview with animated image */}
          <div 
            className="bg-muted rounded-2xl border border-border p-4 flex flex-col min-h-[400px] cursor-pointer group relative overflow-hidden"
            onClick={() => navigate(sectionRoute)}
          >
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-brand-pink/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Image container */}
            <div className={cn(
              "relative flex-1 rounded-xl overflow-hidden transition-all duration-300",
              isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
            )}>
              <img 
                src={sectionImage}
                alt={`${title} preview`}
                className={cn(
                  "w-full h-full object-cover object-top rounded-xl transition-all duration-500",
                  imageLoaded ? "opacity-100" : "opacity-0",
                  "group-hover:scale-[1.02]"
                )}
                onLoad={() => setImageLoaded(true)}
              />
              
              {/* Loading placeholder */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-brand-pink/20 rounded-xl animate-pulse" />
              )}
              
              {/* Overlay with play button */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm">
                  <Play className="w-4 h-4" />
                  Try {title}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Feature caption */}
            <div className={cn(
              "mt-4 text-center transition-all duration-300",
              isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            )}>
              <h4 className="font-display font-semibold text-foreground text-sm">
                {currentFeature?.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Click to explore this feature
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Button 
            className="cta-button"
            onClick={() => navigate('/auth')}
          >
            Try Aura Lift for free
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Start your free trial. Cancel in 1 click.
          </p>
        </div>
      </div>
    </section>
  );
}
