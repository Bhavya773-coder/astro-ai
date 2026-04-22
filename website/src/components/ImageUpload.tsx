import React, { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { GlassCard } from './CosmicUI';
import { Upload, X, Camera } from 'lucide-react';

interface ImageUploadProps {
  onImageReady: (base64: string, mimeType: string) => void;
  maxSizeMB?: number;
  instructions?: string;
  initialPreview?: string | null;
  initialMimeType?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageReady,
  maxSizeMB = 5,
  instructions = 'Upload a clear photo for analysis',
  initialPreview = null,
  initialMimeType = 'image/jpeg'
}) => {
  const [preview, setPreview] = useState<string | null>(initialPreview);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when initialPreview changes
  React.useEffect(() => {
    if (initialPreview) {
      setPreview(initialPreview);
    }
  }, [initialPreview]);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const processFile = useCallback((file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSizeBytes) {
      toast.error(`Image must be smaller than ${maxSizeMB}MB`);
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip the data:mime;base64, prefix
      const base64 = result.split(',')[1];
      const mimeType = file.type;
      onImageReady(base64, mimeType);
    };
    reader.readAsDataURL(file);
  }, [maxSizeBytes, maxSizeMB, onImageReady]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageReady('', '');
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {instructions && (
        <p className="text-white/80 text-sm mb-3">{instructions}</p>
      )}

      {preview ? (
        <GlassCard className="relative p-4">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-white/60 text-xs mt-2 text-center">
            Tap the X to change image
          </p>
        </GlassCard>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-300 min-h-[200px] flex flex-col items-center justify-center
            ${isDragging
              ? 'border-fuchsia-500 bg-fuchsia-500/10'
              : 'border-white/30 hover:border-white/50 hover:bg-white/5'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>

          <p className="text-white font-medium mb-2">
            Tap to upload or drag & drop
          </p>
          <p className="text-white/50 text-sm">
            Max {maxSizeMB}MB • JPG, PNG, WebP
          </p>

          <div className="mt-4 flex items-center gap-2 text-fuchsia-400 text-sm">
            <Upload className="w-4 h-4" />
            <span>Select Image</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
