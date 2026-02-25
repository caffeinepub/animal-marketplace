import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoGalleryProps {
  photos: string[];
  title: string;
}

export default function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  if (!photos || photos.length === 0) {
    return (
      <div className="aspect-[16/9] bg-muted rounded-xl flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <ImageOff className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No photos available</p>
        </div>
      </div>
    );
  }

  const goTo = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, photos.length - 1)));
  };

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-[16/9] bg-muted rounded-xl overflow-hidden">
        {imgError[currentIndex] ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <ImageOff className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Image unavailable</p>
            </div>
          </div>
        ) : (
          <img
            src={photos[currentIndex]}
            alt={`${title} - photo ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            onError={() => setImgError((prev) => ({ ...prev, [currentIndex]: true }))}
          />
        )}

        {/* Navigation arrows */}
        {photos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm hover:bg-card shadow-xs rounded-full"
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm hover:bg-card shadow-xs rounded-full"
              onClick={() => goTo(currentIndex + 1)}
              disabled={currentIndex === photos.length - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Counter */}
        {photos.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-card/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-foreground">
            {currentIndex + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={cn(
                'shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                index === currentIndex
                  ? 'border-primary shadow-xs'
                  : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              {imgError[index] ? (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <ImageOff className="w-4 h-4 text-muted-foreground" />
                </div>
              ) : (
                <img
                  src={photo}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => setImgError((prev) => ({ ...prev, [index]: true }))}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
