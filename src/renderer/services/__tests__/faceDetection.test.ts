import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { detect, load } = vi.hoisted(() => ({
  detect: vi.fn(),
  load: vi.fn(),
}));

vi.mock('@vladmandic/human', () => ({
  default: class MockHuman {
    detect = detect;
    load = load;
  },
}));

import { detectFaces, initializeFaceDetection } from '../faceDetection';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('faceDetection', () => {
  it('loads the local models, keeps only valid face embeddings, and releases the bitmap', async () => {
    const bitmap = { close: vi.fn() } as unknown as ImageBitmap;
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue(bitmap)
    );
    load.mockResolvedValue(undefined);
    detect.mockResolvedValue({
      face: [
        {
          boxRaw: [0.1, 0.2, 0.3, 0.4],
          embedding: Array(64).fill(0.25),
        },
        { boxRaw: [0.2, 0.2, 0.3, 0.4] },
        { boxRaw: [0.2, 0.2, 0.3, 0.4], embedding: [NaN] },
      ],
    });

    await initializeFaceDetection();
    const faces = await detectFaces('/library/photo.jpg', new Uint8Array([1, 2]));

    expect(load).toHaveBeenCalledOnce();
    expect(faces).toEqual([
      {
        photoPath: '/library/photo.jpg',
        box: [0.1, 0.2, 0.3, 0.4],
        descriptor: Array(64).fill(0.25),
      },
    ]);
    expect(bitmap.close).toHaveBeenCalledOnce();
  });
});
