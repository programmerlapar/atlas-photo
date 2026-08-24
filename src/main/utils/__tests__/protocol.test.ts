import { mkdirSync, symlinkSync, writeFileSync } from 'fs';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { isAllowedProtocolPath, restoreAllowedLibraryRoots } from '../protocol';

const temporaryDirectories: string[] = [];

afterEach(() => {
  temporaryDirectories.splice(0).forEach((directory) => {
    rmSync(directory, { recursive: true, force: true });
  });
});

describe('isAllowedProtocolPath', () => {
  it('restores persisted roots before protocol requests are checked', () => {
    const library = mkdtempSync(join(tmpdir(), 'atlas-photo-library-'));
    temporaryDirectories.push(library);
    const photo = join(library, 'photo.jpg');
    writeFileSync(photo, 'photo');

    restoreAllowedLibraryRoots([library]);

    expect(isAllowedProtocolPath(photo)).toBe(photo);
  });

  it('allows existing files within a configured library', () => {
    const library = mkdtempSync(join(tmpdir(), 'atlas-photo-library-'));
    temporaryDirectories.push(library);
    const photo = join(library, 'photo.jpg');
    writeFileSync(photo, 'photo');

    expect(isAllowedProtocolPath(photo, [library])).toBe(photo);
  });

  it('rejects existing files outside configured libraries', () => {
    const library = mkdtempSync(join(tmpdir(), 'atlas-photo-library-'));
    const outside = mkdtempSync(join(tmpdir(), 'atlas-photo-outside-'));
    temporaryDirectories.push(library, outside);
    const secret = join(outside, 'secret.txt');
    writeFileSync(secret, 'secret');

    expect(isAllowedProtocolPath(secret, [library])).toBeNull();
  });

  it('rejects symlinks that resolve outside configured libraries', () => {
    const library = mkdtempSync(join(tmpdir(), 'atlas-photo-library-'));
    const outside = mkdtempSync(join(tmpdir(), 'atlas-photo-outside-'));
    temporaryDirectories.push(library, outside);
    const secret = join(outside, 'secret.txt');
    const link = join(library, 'linked.txt');
    writeFileSync(secret, 'secret');
    mkdirSync(library, { recursive: true });
    symlinkSync(secret, link);

    expect(isAllowedProtocolPath(link, [library])).toBeNull();
  });
});
