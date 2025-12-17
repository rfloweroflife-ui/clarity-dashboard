import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { fetchShopifyProducts, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Shop = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const totalItems = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchShopifyProducts(50);
      setProducts(data);
    } catch (err) {
      setError("Failed to load products. Please try again.");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: ShopifyProduct) => {
    const firstVariant = product.node.variants.edges[0]?.node;
    if (!firstVariant) {
      toast.error("This product is not available");
      return;
    }

    addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || [],
    });

    toast.success(`Added "${product.node.title}" to cart`, {
      position: "top-center",
    });
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
          
          <CartDrawer />
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading products...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadProducts} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No products found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Tell me what products you'd like to add to your store!
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const firstVariant = product.node.variants.edges[0]?.node;
              const price = firstVariant?.price.amount || product.node.priceRange.minVariantPrice.amount;
              const image = product.node.images.edges[0]?.node.url;
              
              return (
                <Card 
                  key={product.node.id} 
                  className="group glass-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[hsl(var(--brand-gold)/0.2)]"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-muted/30">
                    {image ? (
                      <img
                        src={image}
                        alt={product.node.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
                      </div>
                    )}
                    
                    {/* Available Badge */}
                    {firstVariant?.availableForSale === false && (
                      <Badge className="absolute left-3 top-3 bg-muted text-muted-foreground">
                        Out of Stock
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4 space-y-3">
                    {/* Title */}
                    <h3 className="font-medium text-foreground line-clamp-2 leading-snug">
                      {product.node.title}
                    </h3>

                    {/* Description */}
                    {product.node.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {product.node.description}
                      </p>
                    )}

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold text-foreground">
                        {firstVariant?.price.currencyCode || 'USD'} {parseFloat(price).toFixed(2)}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      className="w-full mt-2 cta-button"
                      size="sm"
                      disabled={firstVariant?.availableForSale === false}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
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
