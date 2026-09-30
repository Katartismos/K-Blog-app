/**
 * Cloudinary Client Upload Helper
 *
 * Provides functions to securely upload media directly from the browser
 * to Cloudinary CDN using server-signed upload signatures.
 * This completely bypasses Vercel's 4.5MB serverless function payload limit.
 */

export interface CloudinarySignatureData {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export interface DirectUploadOptions {
  onProgress?: (progressPercent: number) => void;
}

/**
 * Upload an image file directly from the browser to Cloudinary CDN
 * using an authenticated cryptographic signature.
 *
 * @param file The image file selected by the user
 * @param sigData Signature credentials returned by the backend
 * @param options Optional progress callback
 * @returns The secure delivery URL of the uploaded image
 */
export async function uploadImageToCloudinary(
  file: File,
  sigData: CloudinarySignatureData,
  options?: DirectUploadOptions,
): Promise<string> {
  const { signature, timestamp, apiKey, cloudName, folder } = sigData;

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  // If upload progress tracking is requested, use XMLHttpRequest
  if (options?.onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          options.onProgress?.(percent);
        }
      };

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && response.secure_url) {
            resolve(response.secure_url);
          } else {
            const errorMsg =
              response?.error?.message ||
              `Cloudinary upload failed with HTTP status ${xhr.status}`;
            reject(new Error(errorMsg));
          }
        } catch {
          reject(new Error(`Failed to parse Cloudinary response: ${xhr.responseText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error during Cloudinary image upload"));
      };

      xhr.send(formData);
    });
  }

  // Standard fetch fallback
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(
      errorJson?.error?.message ||
        `Cloudinary upload failed with HTTP ${res.status}: ${res.statusText}`,
    );
  }

  const result = await res.json();
  if (!result.secure_url) {
    throw new Error("Cloudinary response did not include a secure_url");
  }

  return result.secure_url;
}
