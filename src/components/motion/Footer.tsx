import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const footerLinks = {
  Product: [
    { label: "Features", route: "/dashboard" },
    { label: "Pricing", route: "/auth" },
    { label: "Integrations", route: "/settings" },
    { label: "Changelog", route: "/dashboard" },
    { label: "Roadmap", route: "/dashboard" },
  ],
  Company: [
    { label: "About", route: "/" },
    { label: "Blog", route: "/" },
    { label: "Careers", route: "/" },
    { label: "Press", route: "/" },
  ],
  Resources: [
    { label: "Help Center", route: "/settings" },
    { label: "API Docs", route: "/settings" },
    { label: "Community", route: "/" },
    { label: "Contact", route: "/settings" },
  ],
  Legal: [
    { label: "Privacy", route: "/" },
    { label: "Terms", route: "/" },
    { label: "Security", route: "/settings" },
  ],
};

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-foreground text-background py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* CTA Section */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to get more done?
          </h2>
          <p className="text-background/70 mb-8">
            Join over 1 million people who have doubled their productivity with Aura Lift Essentials.
          </p>
          <Button 
            className="bg-primary text-primary-foreground font-semibold px-8 py-6 h-auto text-lg rounded-lg hover:opacity-90"
            onClick={() => navigate('/auth')}
          >
            Try Aura Lift for free
          </Button>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.route} 
                      className="text-background/70 hover:text-background transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <span className="font-display font-bold text-xl">Aura Lift</span>
          </Link>
          <p className="text-sm text-background/50">
            © 2024 Aura Lift Essentials. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
