import React, { useState, useRef } from 'react';
import { Camera, X, Star, Upload, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface PhotoUploadSectionProps {
  existingPhotos?: string[]; // URLs of existing photos from server
  existingMainPhoto?: string;
  onPhotosChange: (newFiles: File[], existingUrls: string[], mainIndex: number) => void;
  baseUrl?: string;
  maxPhotos?: number;
}

const PhotoUploadSection: React.FC<PhotoUploadSectionProps> = ({
  existingPhotos = [],
  existingMainPhoto,
  onPhotosChange,
  baseUrl = '',
  maxPhotos = 6
}) => {
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);
  const [keptExistingUrls, setKeptExistingUrls] = useState<string[]>(existingPhotos);
  const [mainIndex, setMainIndex] = useState<number>(() => {
    if (existingMainPhoto && existingPhotos.length > 0) {
      const idx = existingPhotos.indexOf(existingMainPhoto);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allPhotos = [
    ...keptExistingUrls.map(url => ({ type: 'existing' as const, url, display: url.startsWith('http') || url.startsWith('/') ? `${baseUrl}${url.startsWith('/') ? url : '/' + url}` : url })),
    ...newFilePreviews.map((preview, i) => ({ type: 'new' as const, url: preview, display: preview, file: newFiles[i] }))
  ];

  const totalPhotos = allPhotos.length;

  const getDisplayUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob') || url.startsWith('data:')) return url;
    return `${baseUrl}${url}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = maxPhotos - totalPhotos;
    const toAdd = files.slice(0, remaining);
    
    const newPreviews: string[] = [];
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newPreviews.push(ev.target?.result as string);
        if (newPreviews.length === toAdd.length) {
          const updatedFiles = [...newFiles, ...toAdd];
          const updatedPreviews = [...newFilePreviews, ...newPreviews];
          setNewFiles(updatedFiles);
          setNewFilePreviews(updatedPreviews);
          onPhotosChange(updatedFiles, keptExistingUrls, mainIndex);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  const removeExisting = (urlToRemove: string) => {
    const updated = keptExistingUrls.filter(u => u !== urlToRemove);
    setKeptExistingUrls(updated);
    // Adjust mainIndex
    const newMain = Math.min(mainIndex, Math.max(0, updated.length + newFiles.length - 1));
    setMainIndex(newMain);
    onPhotosChange(newFiles, updated, newMain);
  };

  const removeNewFile = (newFileIndex: number) => {
    const updatedFiles = newFiles.filter((_, i) => i !== newFileIndex);
    const updatedPreviews = newFilePreviews.filter((_, i) => i !== newFileIndex);
    setNewFiles(updatedFiles);
    setNewFilePreviews(updatedPreviews);
    // Adjust mainIndex: absolute index of this removed file
    const absIndex = keptExistingUrls.length + newFileIndex;
    let newMain = mainIndex;
    if (mainIndex === absIndex) newMain = 0;
    else if (mainIndex > absIndex) newMain = mainIndex - 1;
    const maxIdx = keptExistingUrls.length + updatedFiles.length - 1;
    newMain = Math.max(0, Math.min(newMain, maxIdx));
    setMainIndex(newMain);
    onPhotosChange(updatedFiles, keptExistingUrls, newMain);
  };

  const setAsMain = (absoluteIndex: number) => {
    setMainIndex(absoluteIndex);
    onPhotosChange(newFiles, keptExistingUrls, absoluteIndex);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-bold text-white/90 flex items-center gap-2">
        <Camera className="h-4 w-4 text-purple-400" />
        Photos du produit
        <span className="text-white/40 font-normal text-xs">({totalPhotos}/{maxPhotos} · optionnel)</span>
      </Label>

      {/* Photo grid */}
      {totalPhotos > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {allPhotos.map((photo, absIndex) => (
            <div
              key={absIndex}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 group",
                mainIndex === absIndex
                  ? "border-amber-400 shadow-lg shadow-amber-500/30"
                  : "border-white/20 hover:border-white/40"
              )}
            >
              <img
                src={photo.display}
                alt={`Photo ${absIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Croix de suppression toujours visible (sauf si dernière photo) */}
              {totalPhotos > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    photo.type === 'existing' ? removeExisting(photo.url) : removeNewFile(absIndex - keptExistingUrls.length);
                  }}
                  className="absolute top-1 right-1 z-10 p-1 rounded-full bg-red-500/90 text-white hover:bg-red-600 shadow-lg transition-all hover:scale-110"
                  title="Supprimer cette photo"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              {/* Overlay on hover pour définir photo principale */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setAsMain(absIndex); }}
                  title="Définir comme photo principale"
                  className={cn(
                    "p-2 rounded-full transition-all",
                    mainIndex === absIndex
                      ? "bg-amber-500 text-white scale-110"
                      : "bg-white/20 text-white hover:bg-amber-500 hover:scale-110"
                  )}
                >
                  <Star className="h-4 w-4 fill-current" />
                </button>
              </div>
              {/* Main badge */}
              {mainIndex === absIndex && (
                <div className="absolute bottom-1 left-1 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-bold shadow-lg">
                  <Star className="h-2.5 w-2.5 fill-white" />
                  Prin.
                </div>
              )}
              {/* Photo number */}
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center justify-center">
                {absIndex + 1}
              </div>
            </div>
          ))}

          {/* Add photo button */}
          {totalPhotos < maxPhotos && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-purple-400 bg-white/5 hover:bg-purple-500/10 flex flex-col items-center justify-center gap-1 transition-all duration-300 group"
            >
              <Upload className="h-5 w-5 text-white/40 group-hover:text-purple-400 transition-colors" />
              <span className="text-[10px] text-white/40 group-hover:text-purple-400 font-medium">Ajouter</span>
            </button>
          )}
        </div>
      )}

      {/* Upload area when no photos */}
      {totalPhotos === 0 && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-8 rounded-2xl border-2 border-dashed border-white/20 hover:border-purple-400 bg-white/5 hover:bg-purple-500/10 flex flex-col items-center justify-center gap-3 transition-all duration-300 group"
        >
          <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-purple-500/20 transition-colors">
            <Camera className="h-8 w-8 text-white/30 group-hover:text-purple-400 transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-white/60 group-hover:text-white/80 font-semibold text-sm transition-colors">Ajouter des photos</p>
            <p className="text-white/30 text-xs mt-0.5">Jusqu'à {maxPhotos} photos · JPG, PNG, WebP</p>
          </div>
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {totalPhotos > 0 && (
        <p className="text-xs text-white/40 flex items-center gap-1.5">
          <Star className="h-3 w-3 text-amber-400" />
          Cliquez <Star className="h-3 w-3 inline text-amber-400 fill-amber-400" /> pour choisir la photo principale
        </p>
      )}
    </div>
  );
};

export default PhotoUploadSection;
