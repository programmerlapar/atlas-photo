/**
 * Shared IPC message type definitions
 */
export interface IPCChannel {
  'select-directory': () => Promise<string | null>;
  'scan-directory': (
    path: string
  ) => Promise<{ photos: unknown[]; error: string | null }>;
  'get-photos': () => Promise<unknown[]>;
  'get-photo-metadata': (path: string) => Promise<unknown>;
  'generate-thumbnail': (path: string) => Promise<unknown>;
}
