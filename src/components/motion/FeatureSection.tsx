import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

export function FeatureSection({ title, features }: FeatureSectionProps) {
  const [activeFeature, setActiveFeature] = useState(features[0].id);

  const currentFeature = features.find(f => f.id === activeFeature);

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12">
          {title}
        </h2>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Feature list */}
          <div className="space-y-4">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={cn(
                  "w-full text-left p-6 rounded-xl border transition-all duration-300",
                  activeFeature === feature.id
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-border hover:border-primary/20"
                )}
              >
                <h3 className={cn(
                  "font-display text-lg font-semibold mb-2",
                  activeFeature === feature.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {feature.title}
                </h3>
                {activeFeature === feature.id && (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                )}
              </button>
            ))}
          </div>

          {/* Feature preview */}
          <div className="bg-muted rounded-2xl border border-border p-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-brand-pink/20 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-muted-foreground">Feature Preview</span>
              </div>
              <h4 className="font-display font-semibold text-foreground">
                {currentFeature?.title}
              </h4>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Button className="cta-button">
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