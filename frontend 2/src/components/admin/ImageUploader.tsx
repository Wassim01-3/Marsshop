import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

const ImageUploader = ({
  images,
  onImagesChange,
  maxImages = 5,
  className,
}: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      const newImages: string[] = [];

      fileArray.forEach((file) => {
        if (
          file.type.startsWith("image/") &&
          images.length + newImages.length < maxImages
        ) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
              newImages.push(result);
              if (
                newImages.length === fileArray.length ||
                images.length + newImages.length >= maxImages
              ) {
                onImagesChange([...images, ...newImages]);
              }
            }
          };
          reader.readAsDataURL(file);
        }
      });
    },
    [images, onImagesChange, maxImages],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed p-8 text-center transition-colors",
          isDragging
            ? "border-mars-500 bg-mars-50"
            : "border-gray-300 hover:border-mars-400",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-gray-100 rounded-full">
            <Upload className="h-8 w-8 text-gray-600" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop images here or click to upload
            </p>
            <p className="text-sm text-gray-600">
              PNG, JPG, JPEG up to 10MB each (max {maxImages} images)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.multiple = true;
              input.accept = "image/*";
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                handleFileUpload(target.files);
              };
              input.click();
            }}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </Card>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {images.length >= maxImages && (
        <p className="text-sm text-gray-600 text-center">
          Maximum {maxImages} images reached
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
