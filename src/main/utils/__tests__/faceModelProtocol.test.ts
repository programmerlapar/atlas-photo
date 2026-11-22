import { describe, expect, it, vi } from 'vitest';

const { getAppPath } = vi.hoisted(() => ({ getAppPath: vi.fn(() => '/app') }));
vi.mock('electron', () => ({
  app: { getAppPath },
  protocol: {},
  session: {},
}));

import { resolveFaceModelPath } from '../protocol';

describe('resolveFaceModelPath', () => {
  it('resolves only bundled model files from the model origin', () => {
    expect(
      resolveFaceModelPath('atlas-model://models/human/blazeface.json')
    ).toBe('/app/public/models/human/blazeface.json');
    expect(resolveFaceModelPath('atlas-model://models/human/faceres.bin')).toBe(
      '/app/public/models/human/faceres.bin'
    );
  });

  it('rejects traversal, unknown assets, and other origins', () => {
    expect(
      resolveFaceModelPath('atlas-model://models/human/../../secret.txt')
    ).toBeNull();
    expect(
      resolveFaceModelPath('atlas-model://models/human/other.bin')
    ).toBeNull();
    expect(
      resolveFaceModelPath('https://example.com/human/faceres.bin')
    ).toBeNull();
  });
});
