import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

interface ProductCardProps {
  title: string;
  price: string;
  compareAtPrice?: string;
  image?: string;
  vendor?: string;
  onAddToCart?: () => void;
}

export const ProductCard = ({
  title,
  price,
  compareAtPrice,
  image,
  vendor,
  onAddToCart,
}: ProductCardProps) => {
  const hasDiscount = compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price);
  const discountPercent = hasDiscount
    ? Math.round((1 - parseFloat(price) / parseFloat(compareAtPrice)) * 100)
    : 0;

  return (
    <Card className="group glass-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[hsl(var(--brand-gold)/0.2)]">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        
        {/* Discount Badge */}
        {hasDiscount && (
          <Badge className="absolute left-3 top-3 bg-destructive text-destructive-foreground font-semibold">
            -{discountPercent}%
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Vendor */}
        {vendor && (
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {vendor}
          </p>
        )}

        {/* Title */}
        <h3 className="font-medium text-foreground line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Pricing */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-foreground">
            ${parseFloat(price).toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ${parseFloat(compareAtPrice).toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button 
          onClick={onAddToCart}
          className="w-full mt-2 cta-button"
          size="sm"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};
