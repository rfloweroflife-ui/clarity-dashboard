import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ShoppingBag, Loader2, Search, X, SlidersHorizontal, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { fetchShopifyProducts, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const Shop = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleWishlist } = useWishlist();

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

  // Extract unique categories from products
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    products.forEach((product) => {
      // Use product type or first tag as category
      const productType = (product.node as any).productType;
      if (productType) {
        categorySet.add(productType);
      }
    });
    return Array.from(categorySet).sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.node.title.toLowerCase().includes(query) ||
          product.node.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((product) => {
        const productType = (product.node as any).productType;
        return productType === selectedCategory;
      });
    }

    // Sorting
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => {
          const priceA = parseFloat(a.node.priceRange.minVariantPrice.amount);
          const priceB = parseFloat(b.node.priceRange.minVariantPrice.amount);
          return priceA - priceB;
        });
        break;
      case "price-desc":
        result.sort((a, b) => {
          const priceA = parseFloat(a.node.priceRange.minVariantPrice.amount);
          const priceB = parseFloat(b.node.priceRange.minVariantPrice.amount);
          return priceB - priceA;
        });
        break;
      case "name-asc":
        result.sort((a, b) => a.node.title.localeCompare(b.node.title));
        break;
      case "name-desc":
        result.sort((a, b) => b.node.title.localeCompare(a.node.title));
        break;
      default:
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortOption]);

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

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortOption("default");
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || sortOption !== "default";

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

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filters:</span>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Options */}
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Results Count */}
          {!loading && !error && (
            <p className="text-center text-sm text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
              {hasActiveFilters && ` (filtered from ${products.length})`}
            </p>
          )}
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
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            {products.length === 0 ? (
              <>
                <p className="text-muted-foreground">No products found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Tell me what products you'd like to add to your store!
                </p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">No products match your filters</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </>
            )}
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const firstVariant = product.node.variants.edges[0]?.node;
              const price = firstVariant?.price.amount || product.node.priceRange.minVariantPrice.amount;
              const image = product.node.images.edges[0]?.node.url;
              
              return (
                <Link 
                  key={product.node.id} 
                  to={`/shop/product/${product.node.handle}`}
                  className="block"
                >
                  <Card 
                    className="group glass-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[hsl(var(--brand-gold)/0.2)] h-full"
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
                      
                      {/* Wishlist Heart */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(
                            product.node.handle,
                            product.node.title,
                            image,
                            price
                          );
                        }}
                        className="absolute right-3 top-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors ${
                            isInWishlist(product.node.handle)
                              ? "fill-red-500 text-red-500"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        />
                      </button>
                      
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="w-full mt-2 cta-button"
                        size="sm"
                        disabled={firstVariant?.availableForSale === false}
                      >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
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
