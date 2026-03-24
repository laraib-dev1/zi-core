import React, { useState } from "react";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { Share2, Twitter, Linkedin, Mail, Link2 } from "lucide-react";
import { FaPinterest } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

interface SocialShareProps {
  productName: string;
  productUrl: string;
  productImage?: string;
  productDescription?: string;
}

export default function SocialShare({
  productName,
  productUrl,
  productImage,
  productDescription,
}: SocialShareProps) {
  const [popupOpen, setPopupOpen] = useState(false);
  const { success } = useToast();

  const encodedUrl = encodeURIComponent(productUrl);
  const encodedTitle = encodeURIComponent(productName);

  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const whatsappShare = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
  const twitterShare = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const linkedinShare = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const pinterestShare = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`;
  const emailShare = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;

  const iconColor = "white";
  const iconSize = 20;
  const sharedClass =
    "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-110";

  const openShare = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setPopupOpen(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(productUrl).then(() => {
      success("Link copied to clipboard");
      setPopupOpen(false);
    });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          url: productUrl,
          text: productDescription || productName,
        });
        setPopupOpen(false);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Share error:", err);
        }
      }
    }
  };

  return (
    <div className="mt-4">
      <span className="text-sm text-gray-700 mb-3 block">Share this on social media</span>
      <div className="flex items-center gap-3">
        {/* Facebook */}
        <a
          href={facebookShare}
          target="_blank"
          rel="noopener noreferrer"
          className={sharedClass}
          style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--theme-dark, #6B4A2C)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--theme-primary, #8B5E3C)";
          }}
          title="Share on Facebook"
        >
          <FaFacebookF size={iconSize} color={iconColor} />
        </a>

        {/* WhatsApp */}
        <a
          href={whatsappShare}
          target="_blank"
          rel="noopener noreferrer"
          className={sharedClass}
          style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--theme-dark, #6B4A2C)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--theme-primary, #8B5E3C)";
          }}
          title="Share on WhatsApp"
        >
          <FaWhatsapp size={iconSize} color={iconColor} />
        </a>

        {/* Share icon – opens native Share dialog by default (system popup), fallback to our popup */}
        <button
          type="button"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (typeof navigator.share === "function") {
              try {
                await navigator.share({
                  title: productName,
                  url: productUrl,
                  text: productDescription || productName,
                });
              } catch (err) {
                if (err instanceof Error && err.name !== "AbortError") {
                  setPopupOpen(true);
                }
              }
            } else {
              setPopupOpen(true);
            }
          }}
          className={sharedClass}
          style={{ backgroundColor: "var(--theme-primary, #8B5E3C)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--theme-dark, #6B4A2C)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--theme-primary, #8B5E3C)";
          }}
          title="Share"
          aria-label="Share (opens system share dialog)"
        >
          <Share2 size={iconSize} color={iconColor} />
        </button>
      </div>

      <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
        <DialogContent className="sm:max-w-md border-gray-600 text-white p-0 gap-0 overflow-hidden" style={{ backgroundColor: "#2d2d2d" }}>
          <DialogHeader className="p-4 pb-2 text-center border-b border-gray-600">
            <DialogTitle className="text-lg font-semibold text-white">Share</DialogTitle>
          </DialogHeader>
          {/* Link section – URL + copy (like system Share) */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-600 bg-[#1f1f1f]">
            <Link2 className="shrink-0 w-5 h-5 text-gray-400" aria-hidden />
            <span className="flex-1 min-w-0 text-sm text-gray-300 truncate" title={productUrl}>
              {productUrl}
            </span>
            <button
              type="button"
              onClick={copyLink}
              className="shrink-0 p-2 rounded hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
              title="Copy link"
              aria-label="Copy link"
            >
              <Link2 className="w-5 h-5" />
            </button>
          </div>
          {/* App icons grid (like system Share) */}
          <div className="p-4">
            <p className="text-xs text-gray-400 mb-3">Share to</p>
            <div className="grid grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => openShare(facebookShare)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white transition-colors"
                title="Facebook"
              >
                <FaFacebookF size={24} />
                <span className="text-xs">Facebook</span>
              </button>
              <button
                type="button"
                onClick={() => openShare(twitterShare)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-black hover:bg-gray-900 text-white transition-colors"
                title="Twitter"
              >
                <Twitter size={24} />
                <span className="text-xs">Twitter</span>
              </button>
              <button
                type="button"
                onClick={() => openShare(whatsappShare)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white transition-colors"
                title="WhatsApp"
              >
                <FaWhatsapp size={24} />
                <span className="text-xs">WhatsApp</span>
              </button>
              <a
                href={emailShare}
                onClick={() => setPopupOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#EA4335] hover:bg-[#D33426] text-white transition-colors"
                title="Gmail"
              >
                <Mail size={24} />
                <span className="text-xs">Gmail</span>
              </a>
              <button
                type="button"
                onClick={() => openShare(linkedinShare)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#0077B5] hover:bg-[#006399] text-white transition-colors"
                title="LinkedIn"
              >
                <Linkedin size={24} />
                <span className="text-xs">LinkedIn</span>
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition-colors"
                title="Copy link"
              >
                <Link2 size={24} />
                <span className="text-xs">Copy link</span>
              </button>
              <button
                type="button"
                onClick={() => openShare(pinterestShare)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#BD081C] hover:bg-[#A00718] text-white transition-colors"
                title="Pinterest"
              >
                <FaPinterest size={24} />
                <span className="text-xs">Pinterest</span>
              </button>
              {typeof navigator.share === "function" && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition-colors"
                  title="More options"
                >
                  <Share2 size={24} />
                  <span className="text-xs">More</span>
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}









// import React from "react";
// import { FaFacebookF, FaInstagram, FaWhatsapp, FaShareAlt } from "react-icons/fa";

// export default function SocialShare() {
//   const url = encodeURIComponent(window.location.href);
//   const title = encodeURIComponent("Check out this product!");

//   const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
//   const whatsappShare = `https://wa.me/?text=${title}%20${url}`;
//   const instagramMessage = `https://www.instagram.com`;

//   const iconColor = "white"; // icon inside circle
//   const circleBgColor = "#b88b5f"; // background of the circle
//   const iconSize = 20; // icon size inside the circle

//   const sharedClass =
//     "flex items-center justify-center w-10 h-10 rounded-full transition-transform duration-200 hover:scale-110 hover:opacity-80";

//   return (
//     <div className="mt-6">
//       <span className="font-semibold block mb-2">Share this on social media</span>

//       <div className="flex items-center gap-4 mt-2">

//         {/* Facebook */}
//         <a
//           href={facebookShare}
//           target="_blank"
//           rel="noopener noreferrer"
//           className={`${sharedClass}`}
//           style={{ backgroundColor: circleBgColor }}
//         >
//           <FaFacebookF size={iconSize} color={iconColor} />
//         </a>

//         {/* WhatsApp */}
//         <a
//           href={whatsappShare}
//           target="_blank"
//           rel="noopener noreferrer"
//           className={`${sharedClass}`}
//           style={{ backgroundColor: circleBgColor }}
//         >
//           <FaWhatsapp size={iconSize} color={iconColor} />
//         </a>

//         {/* Instagram */}
//         <a
//           href={instagramMessage}
//           target="_blank"
//           rel="noopener noreferrer"
//           className={`${sharedClass}`}
//           style={{ backgroundColor: circleBgColor }}
//         >
//           <FaInstagram size={iconSize} color={iconColor} />
//         </a>

//         {/* Native Share */}
//         <button
//           onClick={() => navigator.share?.({ title: "Product", url: window.location.href })}
//           className={`${sharedClass}`}
//           style={{ backgroundColor: circleBgColor }}
//         >
//           <FaShareAlt size={iconSize} color={iconColor} />
//         </button>

//       </div>
//     </div>
//   );
// }
