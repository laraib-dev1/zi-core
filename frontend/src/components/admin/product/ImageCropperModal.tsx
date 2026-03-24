import React, { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Minus, X } from "lucide-react";

type ImageCropperModalProps = {
  open: boolean;
  onClose: () => void;
  file: File | null;
  onCropDone: (croppedBlob: Blob) => void;
  aspect?: number;
};

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  open,
  onClose,
  file,
  onCropDone,
  aspect = 1,
}) => {
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);

  // When crop area changes
  const onCropComplete = useCallback(
    (_: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  // Convert cropped area into Blob
  const getCroppedImageBlob = async (): Promise<Blob | null> => {
    if (!file || !croppedAreaPixels) return null;

    const imageUrl = URL.createObjectURL(file);
    const img = new Image();

    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = imageUrl;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob || null), "image/jpeg");
    });
  };

  const handleCropDone = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const blob = await getCroppedImageBlob();
      if (blob) {
        onCropDone(blob);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate aspect ratio display
  const getAspectRatioText = () => {
    if (aspect === 1) {
      return "1:1";
    } else if (Math.abs(aspect - 4/3) < 0.01) {
      return "4:3";
    } else if (Math.abs(aspect - 3/4) < 0.01) {
      return "3:4";
    } else if (Math.abs(aspect - 16/9) < 0.01) {
      return "16:9";
    } else {
      return `${Math.round(aspect * 100) / 100}:1`;
    }
  };

  // Get dimensions from cropped area
  const getDimensions = () => {
    if (!croppedAreaPixels) return "0000 x 0000";
    return `${Math.round(croppedAreaPixels.width)} x ${Math.round(croppedAreaPixels.height)}`;
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 1));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white p-0 overflow-hidden flex flex-col [&>button]:hidden" style={{ height: "80vh", maxHeight: "90vh" }}>
        <DialogHeader className="px-6 py-4 theme-bg-primary shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg text-black font-semibold">Adjust the image</DialogTitle>
            <button
              onClick={onClose}
              className="rounded-sm opacity-90 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </DialogHeader>

        {file && (
          <div className="relative w-full bg-white flex-1 min-h-1" style={{ position: 'relative', width: '100%', height: '100%', marginTop: 0 }}>
            {/* Zoom Controls - Top Left */}
            <div className="absolute top-4 left-4 z-10 flex flex-row gap-2">
              <button
                onClick={handleZoomIn}
                className="w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--theme-primary)" }}
                aria-label="Zoom in"
              >
                <Plus className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--theme-primary)" }}
                aria-label="Zoom out"
              >
                <Minus className="h-5 w-5 text-white" />
              </button>
            </div>

            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}>
              <Cropper
                image={URL.createObjectURL(file)}
                crop={crop}
                zoom={zoom}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                aspect={aspect || 1}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-t shrink-0">
          <span className="text-sm text-gray-600">
            Use {getDimensions()} or {getAspectRatioText()}
          </span>
          <Button
            onClick={handleCropDone}
            disabled={loading}
            className="theme-button text-white px-6"
          >
            {loading ? "Processing..." : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropperModal;
