import { protocol, session } from 'electron';
import { existsSync } from 'fs';
import { Buffer } from 'buffer';

/**
 * Registers a custom protocol handler for serving thumbnails and photos
 * This allows the renderer to load local files without security restrictions
 *
 * IMPORTANT: When using custom partitions (e.g., 'persist:main'), the protocol
 * must be registered to that specific session, not the default session.
 */
export const registerCustomProtocol = () => {
  try {
    // Get the custom session that matches the partition used in mainWindow
    const customSession = session.fromPartition('persist:main');

    // Protocol handler function
    const protocolHandler = (
      request: Electron.ProtocolRequest,
      callback: (response: Electron.ProtocolResponse) => void
    ) => {
      const url = request.url.replace('atlas-photo://', '');

      // Decode the file path from base64url
      // The renderer uses browser-compatible encoding (TextEncoder + btoa)
      // We need to decode it here in the main process
      try {
        // Convert base64url to base64 (replace - with +, _ with /, add padding)
        let base64 = url.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding if needed
        while (base64.length % 4) {
          base64 += '=';
        }

        // Decode using Buffer (Node.js API available in main process)
        const filePath = Buffer.from(base64, 'base64').toString('utf-8');

        // Verify file exists
        if (existsSync(filePath)) {
        callback({ path: filePath });
        } else {
          console.error('[Protocol] File not found:', filePath);
          callback({ error: -2 }); // FILE_NOT_FOUND
        }
      } catch (error) {
        console.error('Error handling protocol request:', error);
        callback({ error: -2 }); // FILE_NOT_FOUND
      }
    };

    // Unregister protocol first if it exists (to allow re-registration)
    // Note: unregisterProtocol may throw if protocol doesn't exist, so we wrap in try-catch
    try {
        customSession.protocol.unregisterProtocol('atlas-photo');
    } catch (error) {
      // Ignore if protocol doesn't exist or unregister fails
    }

    // Register protocol to the custom session
    customSession.protocol.registerFileProtocol('atlas-photo', protocolHandler);

    // Also register to default session as fallback
    try {
      protocol.unregisterProtocol('atlas-photo');
    } catch (error) {
      // Ignore if protocol doesn't exist or unregister fails
    }
    protocol.registerFileProtocol('atlas-photo', protocolHandler);
  } catch (error) {
    console.error('Failed to register custom protocol:', error);
    throw error;
  }
};
