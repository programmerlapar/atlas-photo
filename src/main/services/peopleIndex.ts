import { app } from 'electron';
import { existsSync } from 'fs';
import { mkdir, readFile, rename, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import type {
  DetectedFace,
  PersonGroup,
  StoredFace,
} from '../../shared/types/people';
import { assignFacesToPeople } from './peopleGrouping';

interface PeopleIndexData {
  version: 1;
  faces: StoredFace[];
  names: Record<string, string>;
}

const emptyIndex = (): PeopleIndexData => ({
  version: 1,
  faces: [],
  names: {},
});

export class PeopleIndex {
  private readonly indexPath = join(
    app.getPath('userData'),
    'storage',
    'people-index-v1.json'
  );
  private data: PeopleIndexData | null = null;
  private writeQueue: Promise<void> = Promise.resolve();

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

  async savePhotoFaces(
    photoPath: string,
    detectedFaces: DetectedFace[]
  ): Promise<PersonGroup[]> {
    const data = await this.load();
    const photoFaces = detectedFaces.map((face) => ({ ...face, photoPath }));
    const faces = assignFacesToPeople(data.faces, photoFaces, () =>
      crypto.randomUUID()
    );
    const personIds = new Set(faces.map((face) => face.personId));
    data.faces = faces;
    data.names = Object.fromEntries(
      Object.entries(data.names).filter(([id]) => personIds.has(id))
    );
    await this.persist();
    return this.getGroups();
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

  async removePhoto(photoPath: string): Promise<void> {
    const data = await this.load();
    if (!data.faces.some((face) => face.photoPath === photoPath)) return;
    data.faces = data.faces.filter((face) => face.photoPath !== photoPath);
    const personIds = new Set(data.faces.map((face) => face.personId));
    data.names = Object.fromEntries(
      Object.entries(data.names).filter(([id]) => personIds.has(id))
    );
    await this.persist();
  }

  async clear(): Promise<void> {
    this.data = emptyIndex();
    await this.writeQueue.catch(() => undefined);
    for (const filePath of [this.indexPath, `${this.indexPath}.tmp`]) {
      try {
        await unlink(filePath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
    }
  }

  private async load(): Promise<PeopleIndexData> {
    if (this.data) return this.data;
    if (!existsSync(this.indexPath)) {
      this.data = emptyIndex();
      return this.data;
    }
    const parsed = JSON.parse(
      await readFile(this.indexPath, 'utf8')
    ) as PeopleIndexData;
    if (parsed.version !== 1 || !Array.isArray(parsed.faces) || !parsed.names) {
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
}
