import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface FullScreenImageModalProps {
  images: { url: string; alt?: string }[];
  isOpen: boolean;
  onClose: () => void;
  initialImageIndex?: number;
  showThumbnails?: boolean;
  showKeyboardHelp?: boolean;
  className?: string;
}

const FullScreenImageModal: React.FC<FullScreenImageModalProps> = ({
  images,
  isOpen,
  onClose,
  initialImageIndex = 0,
  showThumbnails = true,
  showKeyboardHelp = true,
  className = "",
}) => {
  const [selectedImage, setSelectedImage] = useState(initialImageIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Update selected image when initialImageIndex changes
  useEffect(() => {
    setSelectedImage(initialImageIndex);
  }, [initialImageIndex]);

  // Check screen size for mobile responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Handle image navigation
  const handleImageChange = (index: number) => {
    setSelectedImage(index);
  };

  const handleNextImage = () => {
    const nextIndex = (selectedImage + 1) % images.length;
    setSelectedImage(nextIndex);
  };

  const handlePrevImage = () => {
    const prevIndex =
      selectedImage === 0 ? images.length - 1 : selectedImage - 1;
    setSelectedImage(prevIndex);
  };

  const closeModal = () => {
    setIsZoomed(false);
    onClose();
  };

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextImage();
    }
    if (isRightSwipe) {
      handlePrevImage();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "Escape":
          closeModal();
          break;
        case "ArrowLeft":
          handlePrevImage();
          break;
        case "ArrowRight":
          handleNextImage();
          break;
        case " ":
          event.preventDefault();
          setIsZoomed(!isZoomed);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, selectedImage, isZoomed]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">Image Viewer</DialogTitle>
      <DialogContent className="max-w-none w-screen h-screen p-0 bg-black/95">
        <div
          className={cn(
            "relative w-full h-full flex items-center justify-center overflow-hidden",
            className
          )}
        >
          {/* Top Controls Bar - Responsive */}
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-2 sm:p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={closeModal}
                className="p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all duration-200 backdrop-blur-sm"
                title="Close (Esc)"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span className="text-white text-xs sm:text-sm font-medium">
                {selectedImage + 1} of {images.length}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all duration-200 backdrop-blur-sm"
                title="Toggle zoom (Spacebar)"
              >
                {isZoomed ? (
                  <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Image Container - Responsive with Touch Support */}
          <div
            ref={imageRef}
            className={cn(
              "relative w-full h-full flex items-center justify-center transition-all duration-300",
              isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
            )}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <Image
              src={images[selectedImage].url}
              alt={images[selectedImage].alt || `Image ${selectedImage + 1}`}
              fill
              className={cn(
                "transition-all duration-300",
                isZoomed
                  ? isMobile
                    ? "object-contain scale-125"
                    : "object-contain scale-150"
                  : "object-contain"
              )}
              priority
              onClick={() => setIsZoomed(!isZoomed)}
            />
          </div>

          {/* Navigation Buttons - Responsive */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all duration-200 backdrop-blur-sm"
                title="Previous image (←)"
              >
                <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all duration-200 backdrop-blur-sm"
                title="Next image (→)"
              >
                <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* Thumbnail Navigation - Responsive */}
          {showThumbnails && images.length > 1 && (
            <div
              className={cn(
                "absolute left-1/2 -translate-x-1/2",
                isMobile ? "bottom-4" : "bottom-8"
              )}
            >
              <div className="flex gap-1 sm:gap-2 p-1 sm:p-2 bg-black/30 rounded-lg backdrop-blur-sm max-w-[90vw] overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageChange(index)}
                    className={cn(
                      "relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200",
                      isMobile ? "w-8 h-8" : "w-12 h-12",
                      selectedImage === index
                        ? "border-white scale-110"
                        : "border-transparent hover:border-white/50"
                    )}
                  >
                    <Image
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts Help - Responsive */}
          {showKeyboardHelp && !isMobile && (
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm text-xs">
              <div className="space-y-0.5 sm:space-y-1">
                <div>← → Navigate</div>
                <div>Space Zoom</div>
                <div>Esc Close</div>
              </div>
            </div>
          )}

          {/* Mobile Swipe Instructions */}
          {isMobile && images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-2 rounded-lg backdrop-blur-sm text-xs text-center">
              <div>Swipe to navigate</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenImageModal;
