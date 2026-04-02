import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from '../../lib/icons';
import { AnimatedCard } from './AnimatedCard';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  if (!images || images.length === 0) return null;

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setShowLightbox(false);
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Featured Image */}
        <AnimatedCard
          animation="fadeIn"
          className="relative group cursor-pointer overflow-hidden rounded-xl"
          onClick={() => setShowLightbox(true)}
        >
          <img
            src={images[selectedIndex]}
            alt={`${alt} - Image ${selectedIndex + 1}`}
            className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
              <ZoomIn className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
            {selectedIndex + 1} / {images.length}
          </div>
        </AnimatedCard>

        {/* Thumbnail Carousel */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === selectedIndex
                    ? 'border-primary-600 ring-2 ring-primary-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={image}
                  alt={`${alt} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 bg-white bg-opacity-10 hover:bg-opacity-20 text-white p-2 rounded-full transition-all duration-200 z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              className="absolute left-4 bg-white bg-opacity-10 hover:bg-opacity-20 text-white p-3 rounded-full transition-all duration-200 z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Main Image */}
          <img
            src={images[selectedIndex]}
            alt={`${alt} - Image ${selectedIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 bg-white bg-opacity-10 hover:bg-opacity-20 text-white p-3 rounded-full transition-all duration-200 z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2 px-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(index);
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    index === selectedIndex
                      ? 'border-white ring-2 ring-white ring-opacity-50'
                      : 'border-white border-opacity-30 hover:border-opacity-60'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${alt} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
