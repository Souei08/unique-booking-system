import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: { url: string; alt?: string }[];
  aspectRatio?: string;
  showAutoPlay?: boolean;
  showFullScreen?: boolean;
  onImageClick?: (index: number) => void;
  className?: string;
  imageClassName?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  aspectRatio = "aspect-[16/9]",
  showAutoPlay = true,
  showFullScreen = true,
  onImageClick,
  className = "",
  imageClassName = "",
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlayProgress, setAutoPlayProgress] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check screen size for mobile responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      if (!mountedRef.current) return;
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Auto-play functionality with proper cleanup
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!autoPlay || images.length <= 1 || !mountedRef.current) {
      setAutoPlayProgress(0);
      return;
    }

    const startTime = Date.now();
    const duration = 3000; // 3 seconds

    intervalRef.current = setInterval(() => {
      if (!mountedRef.current) {
        clearInterval(intervalRef.current!);
        return;
      }

      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);

      setAutoPlayProgress((prev) => {
        if (!mountedRef.current) return prev;
        return progress;
      });

      if (elapsed >= duration) {
        setSelectedImage((prev) => {
          if (!mountedRef.current) return prev;
          return (prev + 1) % images.length;
        });
        setAutoPlayProgress(0);
      }
    }, 50); // Update progress every 50ms

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoPlay, images.length, selectedImage]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Handle image navigation with safety checks
  const handleImageChange = (index: number) => {
    if (!mountedRef.current || index < 0 || index >= images.length) return;
    setSelectedImage(index);
  };

  const handleNextImage = () => {
    if (!mountedRef.current) return;
    const nextIndex = (selectedImage + 1) % images.length;
    setSelectedImage(nextIndex);
  };

  const handlePrevImage = () => {
    if (!mountedRef.current) return;
    const prevIndex =
      selectedImage === 0 ? images.length - 1 : selectedImage - 1;
    setSelectedImage(prevIndex);
  };

  // Pause auto-play on hover
  const handleCarouselMouseEnter = () => {
    if (autoPlay) {
      setAutoPlay(false);
    }
  };

  const handleCarouselMouseLeave = () => {
    // Don't restart auto-play automatically, let user control it
  };

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick(selectedImage);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          "relative bg-gray-100 rounded-lg flex items-center justify-center",
          aspectRatio,
          className
        )}
      >
        <div className="text-gray-500 text-center">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-sm">No images available</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-white shadow-lg",
        className
      )}
    >
      <div
        className={cn("relative w-full group", aspectRatio)}
        onMouseEnter={handleCarouselMouseEnter}
        onMouseLeave={handleCarouselMouseLeave}
      >
        <Image
          src={images[selectedImage].url}
          alt={images[selectedImage].alt || `Image ${selectedImage + 1}`}
          fill
          className={cn(
            "object-cover cursor-pointer transition-transform duration-300 ",
            imageClassName
          )}
          priority
          onClick={handleImageClick}
          onLoad={() => {
            setImageLoading(false);
            setImageError(false);
          }}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
        />

        {/* Loading Overlay */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-white"></div>
          </div>
        )}

        {/* Error Overlay */}
        {imageError && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-xl sm:text-2xl mb-2">📷</div>
              <div className="text-xs sm:text-sm">Image not available</div>
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Navigation Arrows - Only show on hover */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}

        {/* Control Buttons */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
          {/* Auto-play Toggle */}
          {showAutoPlay && images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAutoPlay(!autoPlay);
              }}
              className={cn(
                "p-1.5 sm:p-2 rounded-lg transition-all duration-200 backdrop-blur-sm",
                autoPlay
                  ? "bg-green-500/80 hover:bg-green-500/90 text-white"
                  : "bg-black/50 hover:bg-black/70 text-white"
              )}
              title={autoPlay ? "Stop auto-play" : "Start auto-play"}
            >
              <div
                className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300",
                  autoPlay && "animate-pulse"
                )}
              >
                {autoPlay ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white rounded-full"></div>
                )}
              </div>
            </button>
          )}

          {/* Full Screen Button */}
          {showFullScreen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleImageClick();
              }}
              className="p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all duration-200 backdrop-blur-sm"
              title="Full screen view"
            >
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-lg backdrop-blur-sm">
            <span className="text-xs sm:text-sm font-medium">
              {selectedImage + 1} / {images.length}
            </span>
          </div>
        )}

        {/* Image Navigation Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
            <div className="flex flex-col gap-1 sm:gap-2">
              {/* Progress Bar */}
              {autoPlay && (
                <div className="w-full bg-white/20 rounded-full h-0.5 sm:h-1">
                  <div
                    className="bg-white h-0.5 sm:h-1 rounded-full transition-all duration-100 ease-linear"
                    style={{ width: `${autoPlayProgress}%` }}
                  />
                </div>
              )}

              {/* Navigation Dots */}
              <div className="flex gap-1.5 sm:gap-2 justify-center">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageChange(index);
                    }}
                    className={cn(
                      "w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300",
                      selectedImage === index
                        ? "bg-white scale-125"
                        : "bg-white/50 hover:bg-white/75"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCarousel;
