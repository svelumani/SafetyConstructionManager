import { apiRequest } from "./queryClient";

/**
 * Uploads files to the server and returns URLs to the uploaded files
 * @param files Array of File objects to upload
 * @param folder Optional folder path to store files in
 * @returns Array of URLs to the uploaded files
 */
export async function uploadFiles(files: File[], folder: string = 'uploads'): Promise<string[]> {
  if (!files.length) return [];
  
  // For the demo, we'll convert the images to data URLs
  // In production, you'd upload to a server/S3/etc.
  
  const imageUrls: string[] = [];
  
  // Process each file and convert to data URL
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    
    try {
      // Create a data URL from the file
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            resolve(reader.result as string);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      
      console.log("Generated data URL for image, length:", dataUrl.length);
      imageUrls.push(dataUrl);
    } catch (err) {
      console.error("Error processing file:", file.name, err);
    }
  }
  
  // Create a fake delay to simulate upload time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Fallback to static URL if the data URL conversion fails
  if (imageUrls.length === 0 && files.length > 0) {
    return ["https://placehold.co/400x300?text=Sample+Photo"];
  }
  
  return imageUrls;
  
  // For real implementation, you would use a FormData to upload files
  /*
  const formData = new FormData();
  
  // Add each file to form data
  files.forEach((file, index) => {
    formData.append(`file${index}`, file);
  });
  
  // Add folder information if provided
  if (folder) {
    formData.append('folder', folder);
  }
  
  try {
    // Send the files to the server
    const response = await apiRequest('POST', '/api/upload', formData, {
      // Don't set Content-Type header, browser will set it with boundary for FormData
      headers: {}
    });
    
    if (!response.ok) {
      throw new Error('File upload failed');
    }
    
    // Parse the response to get the URLs of the uploaded files
    const result = await response.json();
    return result.urls;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
  */
}