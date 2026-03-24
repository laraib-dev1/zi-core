// components/shop/Banner.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

interface BannerProps {
  imageSrc: string;
  alt?: string;
  height?: string;
  targetUrl?: string;
}

const Banner: React.FC<BannerProps> = ({
  imageSrc,
  alt = "Shop Banner",
  height,
  targetUrl,
}) => {
  const navigate = useNavigate();

  const handleBannerClick = () => {
    if (targetUrl && targetUrl.trim() !== "") {
      // Check if it's an external URL or internal route
      if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://")) {
        window.open(targetUrl, "_blank");
      } else {
        navigate(targetUrl);
      }
    }
  };

  // Default responsive height matching landing page hero banner
  const defaultHeight = height || "h-[150px] sm:h-[200px] md:h-[300px] lg:h-[400px] xl:h-[500px]";

  return (
    <section 
      className={`w-full ${defaultHeight} overflow-hidden rounded-lg ${targetUrl ? "cursor-pointer" : ""}`}
      onClick={targetUrl ? handleBannerClick : undefined}
    >
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </section>
  );
};

export default Banner;
