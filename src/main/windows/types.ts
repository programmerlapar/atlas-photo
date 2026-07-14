/**
 * Window type definitions for Electron windows
 */
export interface WindowConfig {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  backgroundColor?: string;
  show?: boolean;
}
