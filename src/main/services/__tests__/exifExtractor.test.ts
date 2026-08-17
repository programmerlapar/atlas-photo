import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('exifr', () => ({
  default: { parse: vi.fn() },
}));

vi.mock('fs/promises', () => ({
  default: { stat: vi.fn() },
  stat: vi.fn(),
}));

import exifr from 'exifr';
import { stat } from 'fs/promises';
import { extractPhotoMetadata } from '../exifExtractor';

const mockedExifrParse = vi.mocked(exifr.parse);
const mockedStat = vi.mocked(stat);

beforeEach(() => {
  vi.clearAllMocks();
  mockedStat.mockResolvedValue({
    birthtimeMs: 1000,
    mtimeMs: 2000,
  } as Awaited<ReturnType<typeof stat>>);
});

describe('extractPhotoMetadata – GPS coordinates', () => {
  it('accepts latitude/longitude of exactly 0 (equator / prime meridian)', async () => {
    mockedExifrParse.mockResolvedValue({
      latitude: 0,
      longitude: 0,
    });

    const result = await extractPhotoMetadata('/fake/photo.jpg');

    expect(result).not.toBeNull();
    expect(result!.location).toEqual({
      latitude: 0,
      longitude: 0,
    });
  });

  it('accepts latitude=0 with non-zero longitude', async () => {
    mockedExifrParse.mockResolvedValue({
      latitude: 0,
      longitude: 106.8,
    });

    const result = await extractPhotoMetadata('/fake/photo.jpg');

    expect(result!.location).toEqual({
      latitude: 0,
      longitude: 106.8,
    });
  });

  it('accepts longitude=0 with non-zero latitude', async () => {
    mockedExifrParse.mockResolvedValue({
      latitude: -6.2,
      longitude: 0,
    });

    const result = await extractPhotoMetadata('/fake/photo.jpg');

    expect(result!.location).toEqual({
      latitude: -6.2,
      longitude: 0,
    });
  });

  it('handles negative zero coordinates', async () => {
    mockedExifrParse.mockResolvedValue({
      latitude: -0,
      longitude: -0,
    });

    const result = await extractPhotoMetadata('/fake/photo.jpg');

    expect(result).not.toBeNull();
    expect(result!.location).toEqual({
      latitude: -0,
      longitude: -0,
    });
  });

  it('includes altitude when present alongside zero coordinates', async () => {
    mockedExifrParse.mockResolvedValue({
      latitude: 0,
      longitude: 0,
      GPSAltitude: 42,
    });

    const result = await extractPhotoMetadata('/fake/photo.jpg');

    expect(result!.location).toEqual({
      latitude: 0,
      longitude: 0,
      altitude: 42,
    });
  });

  it('returns no location when latitude is missing', async () => {
    mockedExifrParse.mockResolvedValue({
      latitude: undefined,
      longitude: 106.8,
    });

    const result = await extractPhotoMetadata('/fake/photo.jpg');

    expect(result!.location).toBeUndefined();
  });

  it('returns no location when longitude is missing', async () => {
    mockedExifrParse.mockResolvedValue({
      latitude: -6.2,
      longitude: undefined,
    });

    const result = await extractPhotoMetadata('/fake/photo.jpg');

    expect(result!.location).toBeUndefined();
  });

  it('returns no location when both are NaN', async () => {
    mockedExifrParse.mockResolvedValue({
      latitude: NaN,
      longitude: NaN,
    });

    const result = await extractPhotoMetadata('/fake/photo.jpg');

    expect(result!.location).toBeUndefined();
  });

  it('returns no location when both are Infinity', async () => {
    mockedExifrParse.mockResolvedValue({
      latitude: Infinity,
      longitude: Infinity,
    });

    const result = await extractPhotoMetadata('/fake/photo.jpg');

    expect(result!.location).toBeUndefined();
  });

  it('returns no location when exifData has no GPS data', async () => {
    mockedExifrParse.mockResolvedValue({
      Make: 'Canon',
    });

    const result = await extractPhotoMetadata('/fake/photo.jpg');

    expect(result!.location).toBeUndefined();
  });

  it('accepts valid non-zero coordinates', async () => {
    mockedExifrParse.mockResolvedValue({
      latitude: -6.2088,
      longitude: 106.8456,
    });

    const result = await extractPhotoMetadata('/fake/photo.jpg');

    expect(result!.location).toEqual({
      latitude: -6.2088,
      longitude: 106.8456,
    });
  });
});
