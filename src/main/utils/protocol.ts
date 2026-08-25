import { protocol, session } from 'electron';
import { existsSync, realpathSync } from 'fs';
import { Buffer } from 'buffer';
import { isAbsolute, relative } from 'path';

type ProtocolCallback = (response: Electron.ProtocolResponse) => void;

const isPathInsideRoot = (filePath: string, rootPath: string): boolean => {
  const relativePath = relative(rootPath, filePath);
  return (
    relativePath === '' ||
    (!relativePath.startsWith('..') && !isAbsolute(relativePath))
  );
};

const canonicalizeRoots = (roots: string[]): string[] =>
  roots.flatMap((root) => {
    try {
      return existsSync(root) ? [realpathSync(root)] : [];
    } catch {
      return [];
    }
  });

export const isAllowedProtocolPath = (
  filePath: string,
  allowedRoots?: string[]
): string | null => {
  if (!isAbsolute(filePath) || !existsSync(filePath)) return null;

  try {
    const resolvedFilePath = realpathSync(filePath);
    return canonicalizeRoots(allowedRoots ?? allowedLibraryRoots).some((root) =>
      isPathInsideRoot(resolvedFilePath, root)
    )
      ? resolvedFilePath
      : null;
  } catch {
    return null;
  }
};

let allowedLibraryRoots: string[] = [];

export const restoreAllowedLibraryRoots = (roots: string[]): void => {
  roots.forEach(addAllowedLibraryRoot);
};

export const addAllowedLibraryRoot = (root: string): void => {
  try {
    if (!existsSync(root)) return;
    const canonicalRoot = realpathSync(root);
    if (!allowedLibraryRoots.includes(canonicalRoot)) {
      allowedLibraryRoots = [...allowedLibraryRoots, canonicalRoot];
    }
  } catch {
    // Ignore directories that disappear while being configured.
  }
};

/**
 * Registers a custom protocol for serving files from configured photo libraries.
 * The same handler is registered on both the main and persistent sessions.
 */
export const registerCustomProtocol = (allowedRoots: string[] = []) => {
  restoreAllowedLibraryRoots(allowedRoots);
  try {
    const customSession = session.fromPartition('persist:main');
    const protocolHandler = (
      request: Electron.ProtocolRequest,
      callback: ProtocolCallback
    ) => {
      const url = request.url.replace('atlas-photo://', '');

      try {
        let base64 = url.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';

        const filePath = Buffer.from(base64, 'base64').toString('utf-8');
        const allowedFilePath = isAllowedProtocolPath(filePath, allowedLibraryRoots);

        if (allowedFilePath) {
          callback({ path: allowedFilePath });
        } else {
          console.warn(
            '[Protocol] Rejected file outside configured library roots:',
            filePath
          );
          callback({ error: -10 });
        }
      } catch (error) {
        console.error('Error handling protocol request:', error);
        callback({ error: -2 });
      }
    };

    try {
      customSession.protocol.unregisterProtocol('atlas-photo');
    } catch {
      // The protocol may not be registered on the first launch.
    }
    customSession.protocol.registerFileProtocol('atlas-photo', protocolHandler);

    try {
      protocol.unregisterProtocol('atlas-photo');
    } catch {
      // The protocol may not be registered on the first launch.
    }
    protocol.registerFileProtocol('atlas-photo', protocolHandler);
  } catch (error) {
    console.error('Failed to register custom protocol:', error);
    throw error;
  }
};
