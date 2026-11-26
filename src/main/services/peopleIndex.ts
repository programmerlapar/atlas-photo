import { app } from 'electron';
import { existsSync } from 'fs';
import {
  appendFile,
  mkdir,
  readFile,
  rename,
  unlink,
  writeFile,
} from 'fs/promises';
import { join } from 'path';
import type {
  DetectedFace,
  FaceScanMode,
  FaceScanQueue,
  PersonGroup,
  StoredFace,
} from '../../shared/types/people';
import type { Photo } from '../../shared/types/photo';
import { assignFacesToPeople } from './peopleGrouping';

interface PeopleIndexData {
  version: 3;
  faces: StoredFace[];
  names: Record<string, string>;
}

interface LegacyPeopleIndexData {
  version: 1;
  faces: StoredFace[];
  names: Record<string, string>;
}

interface PeopleIndexV2Data {
  version: 2;
  faces: StoredFace[];
  names: Record<string, string>;
  photoScanStates: Record<
    string,
    { photoId: string; status: 'complete' | 'failed' }
  >;
}

interface PhotoScanState {
  photoId: string;
  status: 'complete' | 'failed';
}

type PhotoScanJournalEvent = {
  photoPath: string;
  photoId: string;
  status: 'complete' | 'failed' | 'removed';
};

const MAX_SCAN_JOURNAL_BYTES = 1024 * 1024;

const emptyIndex = (): PeopleIndexData => ({
  version: 3,
  faces: [],
  names: {},
});

export class PeopleIndex {
  private readonly indexPath = join(
    app.getPath('userData'),
    'storage',
    'people-index-v1.json'
  );
  private readonly scanStatePath = join(
    app.getPath('userData'),
    'storage',
    'people-scan-index-v1.jsonl'
  );
  private data: PeopleIndexData | null = null;
  private writeQueue: Promise<void> = Promise.resolve();
  private scanWriteQueue: Promise<void> = Promise.resolve();
  private scanStates: Map<string, PhotoScanState> | null = null;
  private scanJournalBytes = 0;
  private scanSnapshotBytes = 0;

  async getGroups(): Promise<PersonGroup[]> {
    const data = await this.load();
    const groups = new Map<string, StoredFace[]>();
    for (const face of data.faces) {
      const group = groups.get(face.personId) ?? [];
      group.push(face);
      groups.set(face.personId, group);
    }

    return Array.from(groups, ([id, faces]) => ({
      id,
      name: data.names[id] ?? '',
      photoPaths: Array.from(new Set(faces.map((face) => face.photoPath))),
      faceCount: faces.length,
    })).sort((a, b) => b.faceCount - a.faceCount || a.id.localeCompare(b.id));
  }

  async getFaceScanQueue(
    photos: Photo[],
    mode: FaceScanMode = 'new'
  ): Promise<FaceScanQueue> {
    await this.load();
    const scanStates = await this.loadScanStates();
    let checked = 0;
    let failed = 0;

    for (const photo of photos) {
      const state = scanStates.get(photo.path);
      if (state?.photoId !== photo.id) continue;
      if (state.status === 'complete') checked++;
      else if (state.status === 'failed') failed++;
    }

    const queuedPhotos = photos.filter((photo) => {
      const state = scanStates.get(photo.path);
      if (mode === 'all') return true;
      if (
        state?.photoId !== photo.id ||
        (state.status !== 'complete' && state.status !== 'failed')
      ) {
        return true;
      }
      return mode === 'retry-failed' && state.status === 'failed';
    });

    return { photos: queuedPhotos, total: photos.length, checked, failed };
  }

  async savePhotoFaces(
    photoPath: string,
    photoId: string,
    detectedFaces: DetectedFace[]
  ): Promise<PersonGroup[] | null> {
    const data = await this.load();
    const hasExistingFaces = data.faces.some(
      (face) => face.photoPath === photoPath
    );
    if (detectedFaces.length === 0 && !hasExistingFaces) {
      await this.appendScanState(photoPath, photoId, 'complete');
      return null;
    }

    const existingFaces = data.faces.filter(
      (face) => face.photoPath !== photoPath
    );
    const photoFaces = detectedFaces.map((face) => ({ ...face, photoPath }));
    const faces = assignFacesToPeople(existingFaces, photoFaces, () =>
      crypto.randomUUID()
    );
    const personIds = new Set(faces.map((face) => face.personId));
    data.faces = faces;
    data.names = Object.fromEntries(
      Object.entries(data.names).filter(([id]) => personIds.has(id))
    );
    await this.persist();
    await this.appendScanState(photoPath, photoId, 'complete');
    return this.getGroups();
  }

  async recordPhotoScanFailure(
    photoPath: string,
    photoId: string
  ): Promise<void> {
    await this.appendScanState(photoPath, photoId, 'failed');
  }

  async renamePerson(personId: string, name: string): Promise<PersonGroup[]> {
    const data = await this.load();
    if (!data.faces.some((face) => face.personId === personId)) {
      throw new Error('Person group no longer exists');
    }
    const normalizedName = name.trim().slice(0, 60);
    if (normalizedName) data.names[personId] = normalizedName;
    else delete data.names[personId];
    await this.persist();
    return this.getGroups();
  }

  async forgetPerson(personId: string): Promise<PersonGroup[]> {
    const data = await this.load();
    if (!data.faces.some((face) => face.personId === personId)) {
      throw new Error('Person group no longer exists');
    }
    data.faces = data.faces.filter((face) => face.personId !== personId);
    delete data.names[personId];
    await this.persist();
    return this.getGroups();
  }

  async removePhoto(photoPath: string): Promise<void> {
    const data = await this.load();
    const scanStates = await this.loadScanStates();
    const hasFaces = data.faces.some((face) => face.photoPath === photoPath);
    if (!hasFaces && !scanStates.has(photoPath)) return;
    if (hasFaces) {
      data.faces = data.faces.filter((face) => face.photoPath !== photoPath);
      const personIds = new Set(data.faces.map((face) => face.personId));
      data.names = Object.fromEntries(
        Object.entries(data.names).filter(([id]) => personIds.has(id))
      );
      await this.persist();
    }
    await this.appendScanState(photoPath, '', 'removed');
  }

  async clear(): Promise<void> {
    this.data = emptyIndex();
    await this.writeQueue.catch(() => undefined);
    await this.scanWriteQueue.catch(() => undefined);
    for (const filePath of [
      this.indexPath,
      `${this.indexPath}.tmp`,
      this.scanStatePath,
      `${this.scanStatePath}.tmp`,
    ]) {
      try {
        await unlink(filePath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
    }
    this.scanStates = new Map();
    this.scanJournalBytes = 0;
    this.scanSnapshotBytes = 0;
  }

  private async load(): Promise<PeopleIndexData> {
    if (this.data) return this.data;
    if (!existsSync(this.indexPath)) {
      this.data = emptyIndex();
      return this.data;
    }
    const parsed = JSON.parse(await readFile(this.indexPath, 'utf8')) as
      PeopleIndexData | PeopleIndexV2Data | LegacyPeopleIndexData;
    if (!Array.isArray(parsed.faces) || !parsed.names) {
      throw new Error(
        'People data could not be read. Disable and re-enable face grouping to clear it.'
      );
    }
    if (parsed.version === 1 || parsed.version === 2) {
      this.data = {
        version: 3,
        faces: parsed.faces,
        names: parsed.names,
      };
      if (parsed.version === 2) {
        const states = new Map<string, PhotoScanState>(
          Object.entries(parsed.photoScanStates)
        );
        await this.persistScanStateSnapshot(states);
        this.scanStates = states;
      }
      await this.persist();
      return this.data;
    }
    if (parsed.version !== 3) {
      throw new Error(
        'People data could not be read. Disable and re-enable face grouping to clear it.'
      );
    }
    this.data = parsed;
    return parsed;
  }

  private async persist(): Promise<void> {
    const data = await this.load();
    this.writeQueue = this.writeQueue.then(async () => {
      const directory = join(app.getPath('userData'), 'storage');
      await mkdir(directory, { recursive: true });
      const temporaryPath = `${this.indexPath}.tmp`;
      await writeFile(temporaryPath, JSON.stringify(data), 'utf8');
      await rename(temporaryPath, this.indexPath);
    });
    return this.writeQueue;
  }

  private async loadScanStates(): Promise<Map<string, PhotoScanState>> {
    if (this.scanStates) return this.scanStates;
    const states = new Map<string, PhotoScanState>();
    try {
      const journal = await readFile(this.scanStatePath, 'utf8');
      this.scanJournalBytes = Buffer.byteLength(journal);
      this.scanSnapshotBytes = this.scanJournalBytes;
      for (const line of journal.split('\n')) {
        if (!line) continue;
        try {
          const event = JSON.parse(line) as Partial<PhotoScanJournalEvent>;
          if (typeof event.photoPath !== 'string') continue;
          if (event.status === 'removed') {
            states.delete(event.photoPath);
          } else if (
            typeof event.photoId === 'string' &&
            (event.status === 'complete' || event.status === 'failed')
          ) {
            states.set(event.photoPath, {
              photoId: event.photoId,
              status: event.status,
            });
          }
        } catch {
          // Ignore a partial trailing journal record and keep valid earlier entries.
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    this.scanStates = states;
    return states;
  }

  private async appendScanState(
    photoPath: string,
    photoId: string,
    status: PhotoScanJournalEvent['status']
  ): Promise<void> {
    const states = await this.loadScanStates();
    const event: PhotoScanJournalEvent = { photoPath, photoId, status };
    const line = `${JSON.stringify(event)}\n`;
    const write = this.scanWriteQueue.then(async () => {
      const directory = join(app.getPath('userData'), 'storage');
      await mkdir(directory, { recursive: true });
      await appendFile(this.scanStatePath, line, 'utf8');
      if (status === 'removed') states.delete(photoPath);
      else states.set(photoPath, { photoId, status });
      this.scanJournalBytes += Buffer.byteLength(line);
      if (
        this.scanJournalBytes - this.scanSnapshotBytes >
        MAX_SCAN_JOURNAL_BYTES
      ) {
        await this.persistScanStateSnapshot(states);
      }
    });
    this.scanWriteQueue = write.catch(() => undefined);
    await write;
  }

  private async persistScanStateSnapshot(
    states: Map<string, PhotoScanState>
  ): Promise<void> {
    const directory = join(app.getPath('userData'), 'storage');
    await mkdir(directory, { recursive: true });
    const snapshot = Array.from(states, ([photoPath, state]) =>
      JSON.stringify({ photoPath, ...state })
    ).join('\n');
    const temporaryPath = `${this.scanStatePath}.tmp`;
    await writeFile(temporaryPath, snapshot ? `${snapshot}\n` : '', 'utf8');
    await rename(temporaryPath, this.scanStatePath);
    this.scanJournalBytes = Buffer.byteLength(snapshot);
    this.scanSnapshotBytes = this.scanJournalBytes;
  }
}
