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
