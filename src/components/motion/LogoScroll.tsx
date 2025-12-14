const logos = [
  { name: "Y Combinator", initials: "YC" },
  { name: "On Deck", initials: "OD" },
  { name: "Efficient App", initials: "EA" },
  { name: "Sparkmate", initials: "SM" },
  { name: "Ally", initials: "AL" },
  { name: "TechCorp", initials: "TC" },
  { name: "StartupXYZ", initials: "SX" },
  { name: "InnovateCo", initials: "IC" },
];

export function LogoScroll() {
  return (
    <section className="py-12 border-y border-border bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground mb-8">
          Over 1 million top performers and teams trust Motion
        </p>
        
        <div className="relative">
          <div className="flex gap-12 logo-scroll">
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={index}
                className="flex-shrink-0 h-12 px-8 flex items-center justify-center bg-background rounded-lg border border-border"
              >
                <span className="font-display font-bold text-muted-foreground">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}