import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { useCartStore } from "@/stores/cartStore";
import { storefrontApiRequest } from "@/lib/shopify";
import { ArrowLeft, Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";

interface ProductDetailNode {
  id: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  handle: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice?: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
        selectedOptions: Array<{
          name: string;
          value: string;
        }>;
      };
    }>;
  };
  options: Array<{
    name: string;
    values: string[];
  }>;
}

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      descriptionHtml
      handle
      vendor
      productType
      tags
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
    }
  }
`;

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ProductDetailNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!handle) return;
      
      try {
        setLoading(true);
        const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
        const fetchedProduct = data.data.productByHandle;
        
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          
          // Initialize selected options with first values
          const initialOptions: Record<string, string> = {};
          fetchedProduct.options?.forEach((option: { name: string; values: string[] }) => {
            if (option.values.length > 0) {
              initialOptions[option.name] = option.values[0];
            }
          });
          setSelectedOptions(initialOptions);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [handle]);

  const findSelectedVariant = () => {
    if (!product?.variants?.edges) return null;
    
    return product.variants.edges.find((variant) => {
      return variant.node.selectedOptions.every(
        (option) => selectedOptions[option.name] === option.value
      );
    })?.node;
  };

  const selectedVariant = findSelectedVariant();

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    const cartItem = {
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions,
    };

    addItem(cartItem);
    toast.success("Added to cart", {
      description: `${product.title} × ${quantity}`,
    });
  };

  const images = product?.images?.edges || [];
  const currentImage = images[selectedImageIndex]?.node;

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout>
        <div className="p-6 max-w-6xl mx-auto text-center py-20">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/shop">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/shop">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Button>
          </Link>
          <CartDrawer />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-xl overflow-hidden bg-muted/30 border border-border/50">
              {currentImage ? (
                <img
                  src={currentImage.url}
                  alt={currentImage.altText || product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingBag className="h-24 w-24 text-muted-foreground/40" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-[hsl(var(--brand-gold))]"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <img
                      src={img.node.url}
                      alt={img.node.altText || `${product.title} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Vendor & Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {product.vendor && (
                <Badge variant="outline" className="uppercase tracking-wider text-xs">
                  {product.vendor}
                </Badge>
              )}
              {product.productType && (
                <Badge variant="secondary" className="text-xs">
                  {product.productType}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-semibold text-foreground leading-tight">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                ${parseFloat(selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount).toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">
                {selectedVariant?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode}
              </span>
            </div>

            {/* Availability */}
            {selectedVariant && (
              <div className="flex items-center gap-2">
                {selectedVariant.availableForSale ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">In Stock</span>
                  </>
                ) : (
                  <span className="text-sm text-destructive">Out of Stock</span>
                )}
              </div>
            )}

            {/* Variant Options */}
            {product.options && product.options.length > 0 && product.options[0].values.length > 1 && (
              <div className="space-y-4">
                {product.options.map((option) => (
                  <div key={option.name} className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {option.name}
                    </label>
                    <Select
                      value={selectedOptions[option.name]}
                      onValueChange={(value) => handleOptionChange(option.name, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Select ${option.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {option.values.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={!selectedVariant?.availableForSale}
              className="w-full cta-button h-12 text-base"
              size="lg"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>

            {/* Description */}
            {product.description && (
              <div className="pt-6 border-t border-border/50">
                <h3 className="text-sm font-medium text-foreground mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="pt-4">
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProductDetail;
