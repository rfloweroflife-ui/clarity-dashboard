import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 gradient-bg">
      <div className="max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border mb-8 fade-in-up">
          <span className="text-sm text-muted-foreground">Voted #1 hottest product by</span>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">A</span>
            </div>
            <span className="font-semibold text-foreground text-sm">Amplitude</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
          Get an unfair advantage by using AI to{' '}
          <span className="gradient-text">double productivity</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
          The <span className="font-semibold text-foreground">#1 Rated Productivity Platform</span> for the AI Era. AI Projects, AI Tasks, AI Calendar, AI Meetings, AI Docs, AI Notes, AI Reports, AI Workflows, and more.
        </p>

        {/* CTA */}
        <div className="fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Button className="cta-button text-lg px-8 py-6 h-auto">
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