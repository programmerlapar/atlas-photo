import type { Photo } from './photo';

export interface DetectedFace {
  photoPath: string;
  box: [number, number, number, number];
  descriptor: number[];
}

export interface StoredFace extends DetectedFace {
  personId: string;
}

export interface PersonGroup {
  id: string;
  name: string;
  photoPaths: string[];
  faceCount: number;
}

export type FaceScanMode = 'new' | 'retry-failed' | 'all';

export interface FaceScanQueue {
  photos: Photo[];
  total: number;
  checked: number;
  failed: number;
}
