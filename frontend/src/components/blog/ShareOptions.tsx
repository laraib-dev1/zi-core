import React, { useState, useEffect } from "react";
import { Facebook, Linkedin, Share2, Mail, Link2 } from "lucide-react";
import { FaPinterest, FaWhatsapp } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

interface ShareOptionsProps {
  url: string;
  title: string;
  showAsPopup?: boolean;
  variant?: "inline" | "sidebar";
  className?: string;
}

export default function ShareOptions({
  url,
  title,
  showAsPopup = false,
  variant = "inline",
  className = "",
}: ShareOptionsProps) {
  const [shareUrl, setShareUrl] = useState(url);
  const [shareTitle, setShareTitle] = useState(title);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { success } = useToast();

  // Update share URL and title when props change
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Always use current page URL if url prop is empty or invalid
      const currentUrl = url && url.trim() !== "" ? url : window.location.href;
      setShareUrl(currentUrl);
      // Use blog title if available, otherwise use document title
      const currentTitle = title && title.trim() !== "" ? title : document.title;
      setShareTitle(currentTitle);
    }
  }, [url, title]);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(shareTitle);

  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        if (showAsPopup) {
          setIsPopupOpen(false);
        }
      } catch (err) {
        // User cancelled or error occurred
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    }
  };

  const handleShareClick = (platform: string, shareLink: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    window.open(shareLink, "_blank", "noopener,noreferrer");
    if (showAsPopup) {
      setIsPopupOpen(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      success("Link copied to clipboard");
      setIsPopupOpen(false);
    });
  };

  // Inline share options (for main content area)
  const InlineShareOptions = () => (
    <div className={`flex items-center gap-3 flex-wrap ${className}`}>
      <button
        onClick={(e) => handleShareClick("facebook", socialLinks.facebook, e)}
        className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:bg-[#166FE5] transition-colors cursor-pointer"
        title="Share on Facebook"
        aria-label="Share on Facebook"
        type="button"
      >
        <Facebook size={20} />
      </button>
      <button
        onClick={(e) => handleShareClick("linkedin", socialLinks.linkedin, e)}
        className="w-10 h-10 rounded-full bg-[#0077B5] text-white flex items-center justify-center hover:bg-[#006399] transition-colors cursor-pointer"
        title="Share on LinkedIn"
        aria-label="Share on LinkedIn"
        type="button"
      >
        <Linkedin size={20} />
      </button>
      <button
        onClick={(e) => handleShareClick("pinterest", socialLinks.pinterest, e)}
        className="w-10 h-10 rounded-full bg-[#BD081C] text-white flex items-center justify-center hover:bg-[#A00718] transition-colors cursor-pointer"
        title="Share on Pinterest"
        aria-label="Share on Pinterest"
        type="button"
      >
        <FaPinterest size={20} />
      </button>
      {typeof navigator.share === "function" && (
        <button
          onClick={handleNativeShare}
          className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
          title="Share"
          aria-label="Share via native share"
          type="button"
        >
          <Share2 size={20} />
        </button>
      )}
    </div>
  );

  const sidebarBtnBase =
    "flex items-center justify-center rounded-lg text-white transition-colors shrink-0 md:w-full md:justify-start md:gap-2 md:px-3 md:py-2.5 md:text-sm md:text-left w-11 h-11 md:h-auto md:min-h-0";

  // Sidebar: full-width labeled buttons on md+, icon-only row on small screens
  const SidebarShareOptions = () => (
    <div className={`flex flex-row flex-wrap justify-start gap-2 md:flex-col md:gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => handleShareClick("facebook", socialLinks.facebook)}
        className={`${sidebarBtnBase} bg-[#1877F2] hover:bg-[#166FE5]`}
        aria-label="Share on Facebook"
      >
        <Facebook size={16} className="shrink-0" />
        <span className="hidden md:inline">Facebook</span>
      </button>
      <button
        type="button"
        onClick={() => handleShareClick("linkedin", socialLinks.linkedin)}
        className={`${sidebarBtnBase} bg-[#0077B5] hover:bg-[#006399]`}
        aria-label="Share on LinkedIn"
      >
        <Linkedin size={16} className="shrink-0" />
        <span className="hidden md:inline">LinkedIn</span>
      </button>
      <button
        type="button"
        onClick={() => handleShareClick("pinterest", socialLinks.pinterest)}
        className={`${sidebarBtnBase} bg-[#BD081C] hover:bg-[#A00718]`}
        aria-label="Share on Pinterest"
      >
        <FaPinterest size={16} className="shrink-0" />
        <span className="hidden md:inline">Pinterest</span>
      </button>
      <button
        type="button"
        onClick={() => handleShareClick("whatsapp", socialLinks.whatsapp)}
        className={`${sidebarBtnBase} bg-[#25D366] hover:bg-[#20BD5A]`}
        aria-label="Share on WhatsApp"
      >
        <FaWhatsapp size={16} className="shrink-0" />
        <span className="hidden md:inline">WhatsApp</span>
      </button>
      {typeof navigator.share === "function" && (
        <button
          type="button"
          onClick={handleNativeShare}
          className={`${sidebarBtnBase} bg-[#3f4752] hover:bg-[#525b68]`}
          aria-label="Share (system dialog)"
        >
          <Share2 size={16} className="shrink-0" />
          <span className="hidden md:inline">Share</span>
        </button>
      )}
    </div>
  );

  // Popup share options
  const PopupShareOptions = () => (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsPopupOpen(true);
        }}
        className={`w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer ${className}`}
        title="Share"
        aria-label="Open share options"
        type="button"
      >
        <Share2 size={20} />
      </button>

      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="sm:max-w-md border-gray-600 text-white p-0 gap-0 overflow-hidden" style={{ backgroundColor: "#2d2d2d" }}>
          <DialogHeader className="p-4 pb-2 text-center border-b border-gray-600">
            <DialogTitle className="text-lg font-semibold text-white">Share</DialogTitle>
          </DialogHeader>
          {/* Link section – URL + copy (like system Share) */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-600 bg-[#1f1f1f]">
            <Link2 className="shrink-0 w-5 h-5 text-gray-400" aria-hidden />
            <span className="flex-1 min-w-0 text-sm text-gray-300 truncate" title={shareUrl}>
              {shareUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
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
                onClick={(e) => handleShareClick("facebook", socialLinks.facebook, e)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white transition-colors"
                title="Facebook"
              >
                <Facebook size={24} />
                <span className="text-xs">Facebook</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleShareClick("whatsapp", socialLinks.whatsapp, e)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white transition-colors"
                title="WhatsApp"
              >
                <FaWhatsapp size={24} />
                <span className="text-xs">WhatsApp</span>
              </button>
              <a
                href={socialLinks.email}
                onClick={() => setIsPopupOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#EA4335] hover:bg-[#D33426] text-white transition-colors"
                title="Gmail"
              >
                <Mail size={24} />
                <span className="text-xs">Gmail</span>
              </a>
              <button
                type="button"
                onClick={(e) => handleShareClick("linkedin", socialLinks.linkedin, e)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#0077B5] hover:bg-[#006399] text-white transition-colors"
                title="LinkedIn"
              >
                <Linkedin size={24} />
                <span className="text-xs">LinkedIn</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition-colors"
                title="Copy link"
              >
                <Link2 size={24} />
                <span className="text-xs">Copy link</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleShareClick("pinterest", socialLinks.pinterest, e)}
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
    </>
  );

  if (showAsPopup) {
    return <PopupShareOptions />;
  }

  // Return sidebar or inline based on variant
  if (variant === "sidebar") {
    return <SidebarShareOptions />;
  }

  // Default: return inline options
  return <InlineShareOptions />;
}

// Export sidebar version as separate component
export function ShareOptionsSidebar({
  url,
  title,
  className = "",
}: Omit<ShareOptionsProps, "showAsPopup" | "variant">) {
  return <ShareOptions url={url} title={title} variant="sidebar" className={className} />;
}
