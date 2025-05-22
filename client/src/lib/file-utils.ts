/**
 * Utility functions for handling file uploads
 */

/**
 * Converts a File object to a data URL
 */
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Compresses an image file to a specified quality
 * @param file The image file to compress
 * @param maxWidth Maximum width of the compressed image
 * @param quality JPEG quality (0-1)
 * @returns A Promise resolving to a Blob of the compressed image
 */
export const compressImage = async (
  file: File,
  maxWidth = 1200,
  quality = 0.7
): Promise<Blob> => {
  // Only compress image files
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const dataUrl = await fileToDataURL(file);
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get the compressed blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Could not compress image"));
          }
        },
        "image/jpeg",
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error("Could not load image"));
    };
  });
};

/**
 * Uploads a file to the server
 * @param file The file to upload
 * @returns A Promise resolving to the URL of the uploaded file
 */
export const uploadFile = async (file: File): Promise<string> => {
  // For images, compress before uploading
  let fileToUpload: File | Blob = file;
  if (file.type.startsWith("image/")) {
    fileToUpload = await compressImage(file);
  }
  
  // Create form data for the file
  const formData = new FormData();
  formData.append("file", fileToUpload, file.name);
  
  // Upload to the server
  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error("Failed to upload file");
  }
  
  const result = await response.json();
  return result.url;
};

/**
 * Uploads multiple files to the server
 * @param files Array of files to upload
 * @returns A Promise resolving to an array of URLs of the uploaded files
 */
export const uploadFiles = async (files: File[]): Promise<string[]> => {
  return Promise.all(files.map(file => uploadFile(file)));
};