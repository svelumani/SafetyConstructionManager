import React, { useRef, useState } from "react";
import { UploadCloud, X, Camera, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onChange: (files: File[]) => void;
  value: File[];
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // size in MB
  maxFiles?: number;
  className?: string;
  showCamera?: boolean;
}

export function FileUpload({
  onChange,
  value = [],
  accept = "image/*",
  multiple = true,
  maxSize = 5, // 5MB default
  maxFiles = 5,
  className = "",
  showCamera = true,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Convert from MB to bytes
  const maxSizeBytes = maxSize * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    
    // Check file count
    if (multiple && value.length + files.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} files`);
      return;
    }
    
    // Check file size
    const oversizedFiles = files.filter(file => file.size > maxSizeBytes);
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed the maximum size of ${maxSize}MB`);
      return;
    }

    setError(null);
    onChange(multiple ? [...value, ...files] : files);
    
    // Reset the input so the same file can be selected again
    e.target.value = "";
  };

  const handleRemove = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraInput = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
      />
      {showCamera && (
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />
      )}

      {/* Preview of selected files */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative group rounded-md overflow-hidden border border-border"
            >
              <div className="aspect-square w-full bg-muted flex items-center justify-center relative">
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileImage className="h-12 w-12 text-muted-foreground" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRemove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-xs p-1 truncate bg-background">
                {file.name.length > 20
                  ? `${file.name.substring(0, 20)}...`
                  : file.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={triggerFileInput}
          className="flex items-center gap-2"
        >
          <UploadCloud className="h-4 w-4" />
          {value.length === 0 ? "Upload photos" : "Add more photos"}
        </Button>
        
        {showCamera && (
          <Button
            type="button"
            variant="outline"
            onClick={triggerCameraInput}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Take photo
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-destructive text-sm">{error}</p>}
      
      {/* Help text */}
      <p className="text-muted-foreground text-xs">
        {`Upload up to ${maxFiles} images (max ${maxSize}MB each)`}
      </p>
    </div>
  );
}