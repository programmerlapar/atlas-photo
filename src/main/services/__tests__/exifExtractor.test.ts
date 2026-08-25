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
  mockedExifrParse.mockResolvedValue(undefined);
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

describe('extractPhotoMetadata - camera information', () => {
  it('extracts camera fields and keeps the compact EXIF reference', async () => {
    mockedExifrParse.mockResolvedValue({
      Make: 'Canon',
      Model: 'EOS R5',
      ISO: 400,
      FNumber: 2.8,
      ExposureTime: 0.005,
      FocalLength: 50,
      UnrelatedValue: 'excluded',
    });

    const result = await extractPhotoMetadata('/fake/photo.jpg');

    expect(result!.camera).toEqual({
      make: 'Canon',
      model: 'EOS R5',
      iso: 400,
      aperture: 'f/2.8',
      shutterSpeed: '0.005s',
      focalLength: '50mm',
    });
    expect(result!.exif).toEqual({
      Make: 'Canon',
      Model: 'EOS R5',
      ISO: 400,
      FNumber: 2.8,
      ExposureTime: 0.005,
      FocalLength: 50,
    });
  });

  it('does not include an empty camera object when camera fields are absent', async () => {
    mockedExifrParse.mockResolvedValue({ ISO: 0, FNumber: 0 });

    const result = await extractPhotoMetadata('/fake/photo.jpg');

    expect(result!.camera).toBeUndefined();
  });
});

describe('extractPhotoMetadata - date resolution', () => {
  it('prefers DateTimeOriginal over fallback date fields', async () => {
    const originalDate = new Date('2024-01-02T03:04:05.000Z');
    mockedExifrParse.mockResolvedValue({
      DateTimeOriginal: originalDate,
      DateTimeDigitized: new Date('2024-02-03T03:04:05.000Z'),
      CreateDate: new Date('2024-03-04T03:04:05.000Z'),
    });

    const result = await extractPhotoMetadata('/fake/photo.jpg');

    expect(result!.date).toEqual(originalDate);
  });

  it('rejects invalid dates and uses the next valid date field', async () => {
    const digitizedDate = new Date('2024-02-03T03:04:05.000Z');
    mockedExifrParse.mockResolvedValue({
      DateTimeOriginal: new Date('invalid'),
      DateTimeDigitized: digitizedDate,
    });

    const result = await extractPhotoMetadata('/fake/photo.jpg');

    expect(result!.date).toEqual(digitizedDate);
  });
});

describe('extractPhotoMetadata - metadata files and errors', () => {
  it('skips macOS metadata files without calling exifr.parse', async () => {
    const result = await extractPhotoMetadata('/fake/._photo.jpg');

    expect(result).toBeNull();
    expect(mockedExifrParse).not.toHaveBeenCalled();
  });

  it('returns the filesystem date when exifr.parse throws', async () => {
    const error = new Error('parse failed');
    mockedExifrParse.mockRejectedValue(error);
    mockedStat.mockResolvedValue({
      birthtimeMs: 1000,
      mtimeMs: 2000,
    } as Awaited<ReturnType<typeof stat>>);
    const result = await extractPhotoMetadata('/fake/photo.jpg');

    expect(result).toBeNull();
  });
});
