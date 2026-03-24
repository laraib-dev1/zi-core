import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { addToWishlist, removeFromWishlist, getUserWishlist } from "@/api/user.api";
import { useToast } from "@/components/ui/toast";
import CircularLoader from "@/components/ui/CircularLoader";

type Props = {
  id: string | number;
  name: string;
  price: number | string;
  image?: string;
  offer?: string;
  isInWishlist?: boolean;
  onRemove?: () => void; // Callback when item is removed from wishlist
  showHeartAlways?: boolean; // Show heart icon always (for wishlist page)
};

export default function ProductCard({ id, name, price, image, offer, isInWishlist: initialIsInWishlist, onRemove, showHeartAlways = false }: Props) {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist || false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check wishlist status on mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      // Check both user and token to prevent unnecessary API calls
      const token = localStorage.getItem("token");
      if (!user || !token) {
        setIsInWishlist(false);
        return;
      }
      try {
        const wishlist = await getUserWishlist();
        const productId = String(id);
        const isInList = Array.isArray(wishlist) && wishlist.some((item: any) => 
          item._id === productId || item.product?._id === productId || item === productId || String(item) === productId
        );
        setIsInWishlist(isInList);
      } catch (err: any) {
        // Silently handle all errors - getUserWishlist already handles 401s
        setIsInWishlist(false);
      }
    };
    checkWishlistStatus();
  }, [id, user]);

  // Calculate prices
  const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;
  const discountPercent = offer ? parseFloat(offer) : 0;
  
  // If discount exists, calculate original price
  const originalPrice = discountPercent > 0 
    ? numericPrice / (1 - discountPercent / 100)
    : numericPrice;
  const discountedPrice = discountPercent > 0 ? numericPrice : originalPrice;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      error("Please login to add items to wishlist");
      return;
    }

    if (wishlistLoading) return;

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist(String(id));
        setIsInWishlist(false);
        success("Removed from wishlist");
        // Call onRemove callback if provided (for wishlist page)
        if (onRemove) {
          onRemove();
        }
      } else {
        await addToWishlist(String(id));
        setIsInWishlist(true);
        success("Added to wishlist");
      }
    } catch (err: any) {
      // Silently handle 401 errors (user not logged in) - already shown error message above
      if (err?.response?.status !== 401) {
        error(err.message || "Failed to update wishlist");
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const CardContent = (
    <article className="flex flex-col bg-slate-100 text-black rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-full relative group">
        {/* Image Container - Takes upper 2/3 of card */}
        <div className="relative w-full flex-[2] min-h-[200px]">
          <div className="relative w-full h-full bg-gray-200 overflow-hidden rounded-t-lg group">
            <img
              src={image?.trim() ? image : "/product.png"}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            />
            {/* Wishlist Button - Top Right Corner - Show on hover or always if showHeartAlways - Show for all users */}
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className={`absolute top-3 right-3 transition-all duration-300 ${
                showHeartAlways ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              } transform translate-y-[-5px] group-hover:translate-y-0 hover:scale-110 z-10 ${
                isInWishlist ? 'theme-text-primary' : 'text-white drop-shadow-lg'
              } ${wishlistLoading ? 'cursor-not-allowed' : ''}`}
              title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              style={isInWishlist ? { color: 'var(--theme-primary)' } : {}}
            >
              {wishlistLoading ? (
                <div className="w-6 h-6 flex items-center justify-center bg-white/80 rounded-full p-1">
                  <CircularLoader 
                    size={16} 
                    color={isInWishlist ? 'var(--theme-primary)' : 'var(--theme-primary)'}
                  />
                </div>
              ) : (
                <Heart 
                  size={24} 
                  className={isInWishlist ? 'fill-current' : ''}
                  strokeWidth={2.5}
                  style={{ 
                    color: isInWishlist ? 'var(--theme-primary)' : 'white',
                    fill: isInWishlist ? 'var(--theme-primary)' : 'transparent'
                  }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Content Section - Takes lower 1/3 of card */}
        <div className="px-4 py-2 flex flex-col bg-white rounded-b-lg relative">
          {/* Item Name */}
          <h3 className="text-base font-medium text-gray-800 mb-1 line-clamp-2">{name}</h3>
          
          {/* Pricing Information with Discount Badge */}
          <div className="flex items-baseline gap-2 justify-between">
            <div className="flex items-baseline gap-2 flex-nowrap min-w-0">
              {discountPercent > 0 ? (
                <>
                  <span className="text-base font-semibold theme-text-primary whitespace-nowrap">
                    Rs: {Math.round(discountedPrice)}
                  </span>
                  <span className="text-base text-gray-600 line-through whitespace-nowrap">
                    {Math.round(originalPrice)}
                  </span>
                </>
              ) : (
                <span className="text-base font-semibold theme-text-primary whitespace-nowrap">
                  Rs: {Math.round(numericPrice)}
                </span>
              )}
            </div>
            {/* Discount Badge - Bottom Right Corner aligned with price */}
            {offer && discountPercent > 0 && (
              <span className="theme-bg-primary text-white text-sm font-semibold px-2 py-1 rounded">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>
      </article>
  );

  return (
    <Link to={id ? `/product/${id}` : '#'}
      className="block h-full w-full"
      style={{ cursor: "pointer" }}
    >
      {CardContent}
    </Link>
  );
}
