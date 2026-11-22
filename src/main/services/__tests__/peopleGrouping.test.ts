import { describe, expect, it } from 'vitest';
import { assignFacesToPeople, cosineSimilarity } from '../peopleGrouping';
import type { StoredFace } from '../../../shared/types/people';

const face = (photoPath: string, descriptor: number[]): StoredFace => ({
  photoPath,
  box: [0.1, 0.1, 0.2, 0.2],
  descriptor,
  personId: `person-${photoPath}`,
});

describe('peopleGrouping', () => {
  it('matches similar faces to the existing person and keeps distinct faces separate', () => {
    const stored = [face('/photos/a.jpg', [1, 0, 0])];
    const next = [
      face('/photos/b.jpg', [0.99, 0.01, 0]),
      face('/photos/c.jpg', [0, 0, 1]),
    ];

    const result = assignFacesToPeople(stored, next, () => 'person-new');

    expect(result.map((item) => item.personId)).toEqual([
      stored[0].personId,
      stored[0].personId,
      'person-new',
    ]);
  });

  it('assigns a stable person id to matching faces found together in a new scan', () => {
    const result = assignFacesToPeople(
      [],
      [face('/photos/a.jpg', [1, 0]), face('/photos/b.jpg', [0.99, 0.01])],
      () => 'person-1'
    );

    expect(result.map((item) => item.personId)).toEqual([
      'person-1',
      'person-1',
    ]);
  });

  it('does not match zero-length or differently-sized descriptors', () => {
    expect(cosineSimilarity([], [])).toBe(0);
    expect(cosineSimilarity([1, 0], [1])).toBe(0);
    expect(cosineSimilarity([0, 0], [0, 0])).toBe(0);
  });

  it('replaces detections for a photo instead of duplicating them on a rescan', () => {
    const stored = [face('/photos/a.jpg', [1, 0])];
    stored[0].personId = 'person-existing';
    const result = assignFacesToPeople(
      stored,
      [face('/photos/a.jpg', [0, 1])],
      () => 'person-new'
    );

    expect(result).toHaveLength(1);
    expect(result[0].photoPath).toBe('/photos/a.jpg');
  });
});
