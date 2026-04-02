import React, { useState, useEffect } from "react";

type Props = {
  images: string[];
  /** Show thumbnail images below main image. Default true. */
  showThumbnails?: boolean;
  /** Use transparent tile backgrounds instead of gray fills. */
  transparentBackground?: boolean;
};

export default function ProductImageGallery({
  images,
  showThumbnails = true,
  transparentBackground = false,
}: Props) {
  const isProbablyRealImageUrl = (img: string) => {
    const t = img.trim();
    if (!t || t === "/product.png") return false;
    if (t.includes("wqwwwq")) return false;
    if (t.startsWith("blob:") || t.startsWith("data:")) return false;
    if (/^https?:\/\//i.test(t) || t.startsWith("//") || t.startsWith("/")) return true;
    return !t.toLowerCase().includes("placeholder");
  };

  const validImages = images.filter((img) => typeof img === "string" && isProbablyRealImageUrl(img));
  
  const displayImages = validImages.length > 0 ? validImages : ["/product.png"];
  const [selected, setSelected] = useState(displayImages[0] || "/product.png");

  // Reset selected image when images prop changes (product changes)
  useEffect(() => {
    const firstImage = displayImages[0] || "/product.png";
    setSelected(firstImage);
  }, [displayImages.length, displayImages[0]]); // Use displayImages length and first image as dependency

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Main Image - 1:1 aspect ratio (square) */}
      <div
        className={`w-full max-w-[26rem] aspect-square overflow-hidden rounded-lg border border-gray-200 flex items-center justify-center ${
          transparentBackground ? "bg-transparent" : "bg-gray-100"
        }`}
      >
        <img
          src={selected}
          alt="Product"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/product.png";
          }}
        />
      </div>

      {/* Thumbnails - same width as main image (max-w-[26rem]) */}
      {showThumbnails && (
      <div className="grid grid-cols-4 gap-2 w-full max-w-[26rem]">
        {displayImages.slice(0, 4).map((img, i) => (
          <div
            key={i}
            onClick={() => setSelected(img)}
            className={`w-full aspect-square overflow-hidden rounded-lg border-2 cursor-pointer transition-all ${
              transparentBackground ? "bg-transparent" : "bg-gray-100"
            }
              ${selected === img ? "" : "border-gray-200"}`}
            style={selected === img ? { borderColor: "var(--theme-primary)" } : {}}
          >
            <img
              src={img}
              alt={`Thumbnail ${i + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/product.png";
              }}
            />
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
