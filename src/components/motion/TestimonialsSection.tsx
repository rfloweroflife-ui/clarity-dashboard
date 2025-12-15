import { useNavigate } from "react-router-dom";

const testimonials = [
  {
    quote: "Aura Lift saved me from under-performing at my job, I feel so much less stressed and finally have a healthy work-life balance",
    author: "Matt J",
    role: "Business Analyst",
  },
  {
    quote: "Aura Lift helped me get promoted 12 months faster than peers",
    author: "Jason H",
    role: "Marketing Manager",
  },
  {
    quote: "Aura Lift helped make our business an extra $700k/year because we were able to complete client projects faster",
    author: "Evan H",
    role: "Business Owner",
  },
  {
    quote: "Aura Lift saved us what's equivalent to $250k a year of time previously wasted in emails and meetings",
    author: "Sean H",
    role: "COO",
  },
];

export function TestimonialsSection() {
  const navigate = useNavigate();

  return (
    <section id="testimonials" className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
          Aura Lift Essentials is built for individuals and teams of all sizes
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Whether you are an individual, a 20-person team, or a 1000-person business
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="testimonial-card cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() => navigate('/auth')}
            >
              <blockquote className="text-foreground font-medium mb-4">
                "{testimonial.quote}"
              </blockquote>
              <div>
                <p className="font-semibold text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
