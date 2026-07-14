/**
 * Utility functions for encoding/decoding photo IDs and file paths for URLs
 * Photo IDs contain full file paths which can break URL routing
 */

/**
 * Encodes a string to base64url (browser-compatible)
 * Uses TextEncoder and btoa for browser compatibility
 */
const encodeToBase64Url = (str: string): string => {
  // Convert string to Uint8Array using TextEncoder
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);

  // Convert Uint8Array to binary string for btoa
  // Use chunking for large arrays to avoid stack overflow
  let binaryString = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    binaryString += String.fromCharCode(...chunk);
  }

  // Convert to base64 using btoa
  const base64 = btoa(binaryString);

  // Convert to base64url (replace + with -, / with _, remove padding)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * Decodes base64url to string (browser-compatible)
 * Uses TextDecoder and atob for browser compatibility
 */
const decodeFromBase64Url = (base64url: string): string => {
  try {
    // Convert base64url to base64 (replace - with +, _ with /, add padding)
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }

    // Convert base64 to binary string using atob
    const binaryString = atob(base64);

    // Convert binary string to Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert Uint8Array to string using TextDecoder
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } catch (error) {
    console.error('Error decoding base64url:', error);
    throw error;
  }
};

/**
 * Encodes a photo ID for use in URLs
 * Uses base64url encoding to avoid special characters
 */
export const encodePhotoId = (photoId: string): string => {
  return encodeToBase64Url(photoId);
};

/**
 * Decodes a photo ID from URL-encoded format
 */
export const decodePhotoId = (encodedId: string): string => {
  try {
    return decodeFromBase64Url(encodedId);
  } catch (error) {
    console.error('Error decoding photo ID:', error);
    return encodedId; // Return as-is if decoding fails
  }
};

/**
 * Encodes a file path for use in custom protocol URLs
 * Uses base64url encoding to avoid special characters
 */
export const encodeFilePath = (filePath: string): string => {
  return encodeToBase64Url(filePath);
};
