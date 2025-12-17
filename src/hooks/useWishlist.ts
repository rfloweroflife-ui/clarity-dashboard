import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  product_handle: string;
  product_title: string;
  product_image: string | null;
  product_price: string | null;
  created_at: string;
}

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("wishlists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback(
    (productHandle: string) => {
      return wishlistItems.some((item) => item.product_handle === productHandle);
    },
    [wishlistItems]
  );

  const addToWishlist = async (
    productHandle: string,
    productTitle: string,
    productImage?: string,
    productPrice?: string
  ) => {
    if (!user) {
      toast.error("Please sign in to save items to your wishlist");
      return false;
    }

    try {
      const { error } = await supabase.from("wishlists").insert({
        user_id: user.id,
        product_handle: productHandle,
        product_title: productTitle,
        product_image: productImage || null,
        product_price: productPrice || null,
      });

      if (error) {
        if (error.code === "23505") {
          // Already in wishlist
          return true;
        }
        throw error;
      }

      await fetchWishlist();
      toast.success("Added to wishlist");
      return true;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add to wishlist");
      return false;
    }
  };

  const removeFromWishlist = async (productHandle: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("product_handle", productHandle);

      if (error) throw error;

      await fetchWishlist();
      toast.success("Removed from wishlist");
      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
      return false;
    }
  };

  const toggleWishlist = async (
    productHandle: string,
    productTitle: string,
    productImage?: string,
    productPrice?: string
  ) => {
    if (isInWishlist(productHandle)) {
      return removeFromWishlist(productHandle);
    } else {
      return addToWishlist(productHandle, productTitle, productImage, productPrice);
    }
  };

  return {
    wishlistItems,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    refetch: fetchWishlist,
  };
};
