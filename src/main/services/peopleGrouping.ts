import type { DetectedFace, StoredFace } from '../../shared/types/people';

const PERSON_SIMILARITY_THRESHOLD = 0.72;

export const cosineSimilarity = (left: number[], right: number[]): number => {
  if (left.length === 0 || left.length !== right.length) return 0;

  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < left.length; index++) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += right[index] ** 2;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) return 0;
  return dot / Math.sqrt(leftMagnitude * rightMagnitude);
};

/** Assign new detections to the closest existing face group above threshold. */
export const assignFacesToPeople = (
  storedFaces: StoredFace[],
  detectedFaces: DetectedFace[],
  createPersonId: () => string
): StoredFace[] => {
  const replacedPaths = new Set(detectedFaces.map((face) => face.photoPath));
  const nextFaces = storedFaces
    .filter((face) => !replacedPaths.has(face.photoPath))
    .map((face) => ({ ...face, descriptor: [...face.descriptor] }));
  const centroids = new Map<string, { descriptor: number[]; count: number }>();
  for (const face of nextFaces) {
    const centroid = centroids.get(face.personId);
    if (!centroid) {
      centroids.set(face.personId, {
        descriptor: [...face.descriptor],
        count: 1,
      });
      continue;
    }
    if (centroid.descriptor.length !== face.descriptor.length) continue;
    centroid.descriptor = centroid.descriptor.map(
      (value, index) =>
        value + (face.descriptor[index] - value) / (centroid.count + 1)
    );
    centroid.count++;
  }

  for (const detected of detectedFaces) {
    let bestPersonId: string | null = null;
    let bestSimilarity = PERSON_SIMILARITY_THRESHOLD;
    for (const [personId, centroid] of centroids) {
      const similarity = cosineSimilarity(
        detected.descriptor,
        centroid.descriptor
      );
      if (similarity > bestSimilarity) {
        bestPersonId = personId;
        bestSimilarity = similarity;
      }
    }

    const personId = bestPersonId ?? createPersonId();
    nextFaces.push({
      ...detected,
      box: [...detected.box],
      descriptor: [...detected.descriptor],
      personId,
    });
    const centroid = centroids.get(personId);
    if (!centroid) {
      centroids.set(personId, {
        descriptor: [...detected.descriptor],
        count: 1,
      });
    } else if (centroid.descriptor.length === detected.descriptor.length) {
      centroid.descriptor = centroid.descriptor.map(
        (value, index) =>
          value + (detected.descriptor[index] - value) / (centroid.count + 1)
      );
      centroid.count++;
    }
  }

  return nextFaces;
};
