import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

// Sample products with updated pricing from Shopify
const products = [
  {
    id: "1",
    title: "Moisturizing Skin Anti-wrinkle Firming Fade Spots 5-in-1 Facial",
    price: "18.95",
    compareAtPrice: "29.95",
    image: "/placeholder.svg",
    vendor: "Aura Lift Essentials",
  },
  {
    id: "2",
    title: "PDRN Collagen Jelly Cream 50ml",
    price: "24.95",
    compareAtPrice: "34.95",
    image: "/placeholder.svg",
    vendor: "Aura Lift Essentials",
  },
  {
    id: "3",
    title: "Hydrating Essence Serum",
    price: "21.95",
    compareAtPrice: "29.95",
    image: "/placeholder.svg",
    vendor: "Aura Lift Essentials",
  },
];

const Shop = () => {
  const handleAddToCart = (productTitle: string) => {
    toast.success(`Added "${productTitle}" to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Link>
          
          <h1 className="text-lg font-semibold tracking-luxury">Shop</h1>
          
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              0
            </span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
            Premium Skincare Collection
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover our curated selection of luxury skincare products designed to elevate your daily routine.
          </p>
        </div>

        {/* Sale Banner */}
        <div className="mb-8 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-center">
          <p className="text-sm font-medium text-foreground">
            🎉 Limited Time Sale — Save up to 40% on select items
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              title={product.title}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              image={product.image}
              vendor={product.vendor}
              onAddToCart={() => handleAddToCart(product.title)}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Aura Lift Essentials. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Shop;
