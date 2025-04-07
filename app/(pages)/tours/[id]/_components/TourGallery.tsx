"use client";

import { useState } from "react";

// Mock tour images - replace with actual tour images from the API
const tourImages = [
  {
    src: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1679&q=80",
    alt: "Tour main image",
  },
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1679&q=80",
    alt: "Tour secondary image",
  },
  {
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1679&q=80",
    alt: "Tour tertiary image",
  },
  {
    src: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?ixlib=rb-1.2.1&auto=format&fit=crop&w=1679&q=80",
    alt: "Tour featured image",
  },
];

export function TourGallery() {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="mx-auto mt-6 max-w-2xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-x-8 lg:px-8">
      {tourImages && tourImages.length > 0 ? (
        <>
          <img
            alt={tourImages[selectedImage].alt}
            src={tourImages[selectedImage].src}
            className="hidden aspect-3/4 size-full rounded-lg object-cover lg:block"
          />
          <div className="hidden lg:grid lg:grid-cols-1 lg:gap-y-8">
            {tourImages.slice(1, 3).map((image, index) => (
              <img
                key={index}
                alt={image.alt}
                src={image.src}
                className="aspect-3/2 size-full rounded-lg object-cover cursor-pointer"
                onClick={() => setSelectedImage(index + 1)}
              />
            ))}
          </div>
          {tourImages.length > 3 && (
            <img
              alt={tourImages[3].alt}
              src={tourImages[3].src}
              className="aspect-4/5 size-full object-cover sm:rounded-lg lg:aspect-3/4 cursor-pointer"
              onClick={() => setSelectedImage(3)}
            />
          )}
        </>
      ) : (
        <div className="col-span-full text-center py-6">
          <p className="text-gray-500">No images available for this tour.</p>
        </div>
      )}
    </div>
  );
}
