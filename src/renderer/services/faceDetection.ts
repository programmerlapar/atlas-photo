import type { DetectedFace } from '../../shared/types/people';

type FaceDetector = {
  load: () => Promise<void>;
  detect: (image: ImageBitmap) => Promise<{
    face: Array<{
      boxRaw: [number, number, number, number];
      embedding?: number[];
    }>;
  }>;
};

let detectorPromise: Promise<FaceDetector> | null = null;

const loadDetector = async (): Promise<FaceDetector> => {
  if (!detectorPromise) {
    detectorPromise = import('@vladmandic/human')
      .then(({ default: Human }) => {
        const detector = new Human({
          backend: 'webgl',
          modelBasePath: 'atlas-model://models/human/',
          debug: false,
          face: {
            enabled: true,
            detector: {
              enabled: true,
              modelPath: 'blazeface.json',
              minConfidence: 0.65,
            },
            description: {
              enabled: true,
              modelPath: 'faceres.json',
              minConfidence: 0.65,
            },
            mesh: { enabled: false },
            attention: { enabled: false },
            iris: { enabled: false },
            emotion: { enabled: false },
            antispoof: { enabled: false },
            liveness: { enabled: false },
            gear: { enabled: false },
          },
          body: { enabled: false },
          hand: { enabled: false },
          object: { enabled: false },
          gesture: { enabled: false },
        });
        return detector as unknown as FaceDetector;
      })
      .catch((error: unknown) => {
        detectorPromise = null;
        throw error;
      });
  }
  return detectorPromise;
};

export const initializeFaceDetection = async (): Promise<void> => {
  const detector = await loadDetector();
  try {
    await detector.load();
  } catch (error) {
    detectorPromise = null;
    throw error;
  }
};

export const detectFaces = async (
  photoPath: string,
  thumbnailBytes: Uint8Array
): Promise<DetectedFace[]> => {
  const image = await createImageBitmap(
    new Blob([thumbnailBytes], { type: 'image/jpeg' })
  );
  try {
    const detector = await loadDetector();
    const result = await detector.detect(image);
    return result.face.flatMap((face) => {
      if (!face.embedding || face.embedding.length < 64) return [];
      if (face.embedding.some((value) => !Number.isFinite(value))) return [];
      return [
        {
          photoPath,
          box: face.boxRaw,
          descriptor: face.embedding,
        },
      ];
    });
  } finally {
    image.close();
  }
};
