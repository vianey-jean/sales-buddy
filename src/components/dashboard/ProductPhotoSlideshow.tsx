import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X, ImageOff, Star, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductPhotoSlideshowProps {
  photos: string[];
  mainPhoto?: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  baseUrl?: string;
}

const ProductPhotoSlideshow: React.FC<ProductPhotoSlideshowProps> = ({
  photos,
  mainPhoto,
  productName,
  isOpen,
  onClose,
  baseUrl = ''
}) => {
  const allPhotos = photos && photos.length > 0 ? photos : (mainPhoto ? [mainPhoto] : []);
  
  // Start from mainPhoto if present
  const mainIndex = mainPhoto ? Math.max(0, allPhotos.indexOf(mainPhoto)) : 0;
  const [currentIndex, setCurrentIndex] = useState(mainIndex);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % allPhotos.length);
  }, [allPhotos.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + allPhotos.length) % allPhotos.length);
  }, [allPhotos.length]);

  // Auto-play every 5 seconds
  useEffect(() => {
    if (!isOpen || !isAutoPlaying || allPhotos.length <= 1) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [isOpen, isAutoPlaying, goNext, allPhotos.length]);

  // Reset index when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(mainIndex);
      setIsAutoPlaying(true);
    }
  }, [isOpen, mainIndex]);

  const getPhotoUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob') || url.startsWith('data:')) return url;
    return `${baseUrl}${url}`;
  };

  if (allPhotos.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-black text-center">{productName}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <ImageOff className="h-16 w-16 text-white/30" />
            </div>
            <p className="text-white/50 font-medium">Aucune photo disponible</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
              <Camera className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm">{productName}</h3>
              <p className="text-white/50 text-xs">{currentIndex + 1} / {allPhotos.length} photos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Auto-play toggle */}
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300",
                isAutoPlaying 
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              )}
            >
              {isAutoPlaying ? '▶ Auto' : '⏸ Pause'}
            </button>
          </div>
        </div>

        {/* Main photo area */}
        <div className="relative bg-black/40 flex items-center justify-center" style={{ minHeight: '360px' }}>
          {/* Navigation buttons */}
          {allPhotos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setIsAutoPlaying(false); goPrev(); }}
                className="absolute left-3 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white hover:scale-110 transition-all duration-200 backdrop-blur-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsAutoPlaying(false); goNext(); }}
                className="absolute right-3 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white hover:scale-110 transition-all duration-200 backdrop-blur-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Current Photo */}
          <img
            key={currentIndex}
            src={getPhotoUrl(allPhotos[currentIndex])}
            alt={`${productName} - Photo ${currentIndex + 1}`}
            className="max-h-96 max-w-full object-contain transition-all duration-500 select-none"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '';
              (e.target as HTMLImageElement).className = 'hidden';
            }}
          />

          {/* Main photo badge */}
          {allPhotos[currentIndex] === mainPhoto && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-black shadow-lg shadow-amber-500/40">
              <Star className="h-3 w-3 fill-white" />
              Photo principale
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {allPhotos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-4 py-3 border-t border-white/10 bg-black/20">
            {allPhotos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => { setIsAutoPlaying(false); setCurrentIndex(idx); }}
                className={cn(
                  "relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-300",
                  idx === currentIndex
                    ? "border-purple-400 shadow-lg shadow-purple-500/40 scale-105"
                    : "border-white/20 hover:border-white/40 hover:scale-105 opacity-60 hover:opacity-100"
                )}
              >
                <img
                  src={getPhotoUrl(photo)}
                  alt={`Miniature ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {photo === mainPhoto && (
                  <div className="absolute top-0.5 right-0.5">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400 drop-shadow-lg" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Progress dots */}
        {allPhotos.length > 1 && (
          <div className="flex justify-center gap-2 py-3">
            {allPhotos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setIsAutoPlaying(false); setCurrentIndex(idx); }}
                className={cn(
                  "rounded-full transition-all duration-300",
                  idx === currentIndex
                    ? "w-6 h-2 bg-gradient-to-r from-purple-400 to-pink-400"
                    : "w-2 h-2 bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductPhotoSlideshow;
