import { useEffect, useRef, useState } from 'react';
import { useMotionNavigate } from '../hooks/useMotionNavigate';
import type { PersonGroup } from '../../shared/types/people';
import {
  detectFaces,
  initializeFaceDetection,
} from '../services/faceDetection';
import { encodeFilePath } from '../utils/photoId';
import { Button, Card } from '../components/ui';

const PeopleView = () => {
  const navigate = useMotionNavigate();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [groups, setGroups] = useState<PersonGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const cancelled = useRef(false);

  const loadPeople = async () => {
    setError(null);
    setLoading(true);
    try {
      const isEnabled = await window.electronAPI.getFaceGroupingEnabled();
      setEnabled(isEnabled);
      const storedGroups = isEnabled
        ? await window.electronAPI.getPeopleGroups()
        : [];
      setGroups(storedGroups);
      setNames(
        Object.fromEntries(storedGroups.map((group) => [group.id, group.name]))
      );
    } catch {
      setError(
        'People data could not be loaded. Check the storage location and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPeople();
    return () => {
      cancelled.current = true;
    };
  }, []);

  const scanLibrary = async () => {
    if (!enabled || scanning) return;
    setError(null);
    setScanMessage(null);
    setScanning(true);
    cancelled.current = false;
    try {
      const photos = await window.electronAPI.getLibraryPhotos();
      setProgress({ current: 0, total: photos.length });
      if (photos.length === 0) {
        setScanMessage(
          'No photos are indexed in your saved libraries yet. Open an album, then try again.'
        );
        return;
      }

      await initializeFaceDetection();

      let failed = 0;
      let processed = 0;
      for (const photo of photos) {
        if (cancelled.current) break;
        try {
          const thumbnail = await window.electronAPI.getPhotoThumbnailData(
            photo.path
          );
          if (!thumbnail) throw new Error('Preview unavailable');
          const faces = await detectFaces(photo.path, thumbnail);
          setGroups(
            await window.electronAPI.saveDetectedFaces(photo.path, faces)
          );
          processed++;
        } catch {
          failed++;
        }
        setProgress({ current: processed + failed, total: photos.length });
      }

      if (cancelled.current) {
        setScanMessage(
          `Stopped after ${processed} photos. Completed results are saved on this device.`
        );
      } else if (failed > 0) {
        setScanMessage(
          `Checked ${processed} photos; ${failed} could not be analyzed. You can safely scan again.`
        );
      } else {
        setScanMessage(
          `Checked ${processed} photos. Similar faces are grouped below.`
        );
      }
    } catch {
      setError(
        'The library could not be scanned. Your existing people groups are preserved; try again.'
      );
    } finally {
      setScanning(false);
      cancelled.current = false;
    }
  };

  const saveName = async (group: PersonGroup) => {
    try {
      const updatedGroups = await window.electronAPI.renamePerson(
        group.id,
        names[group.id] ?? ''
      );
      setGroups(updatedGroups);
      setNames(Object.fromEntries(updatedGroups.map((item) => [item.id, item.name])));
      setError(null);
    } catch {
      setError(
        `The name for ${group.name || 'this person'} could not be saved. Try again.`
      );
    }
  };

  if (loading) {
    return (
      <section
        className="p-8 text-sm text-[var(--text-secondary)]"
        role="status"
      >
        Loading people settings…
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl p-8 text-[var(--text-primary)]">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">People</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
            Detect faces and group likely matches locally. Groups are
            suggestions; review them before relying on a match.
          </p>
        </div>
        {enabled && (
          <div className="flex gap-2">
            {scanning ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  cancelled.current = true;
                }}
                className="rounded-lg px-3 py-2"
              >
                Stop scan
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => void scanLibrary()}
                className="rounded-lg px-3 py-2"
              >
                Scan library
              </Button>
            )}
          </div>
        )}
      </header>

      {!enabled && (
        <div className="mt-6 rounded-2xl border border-[var(--border-default)] bg-[var(--glass-bg-1)] p-6">
          <h2 className="font-medium">Face grouping is off</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            To use People, enable face grouping in Settings. Face embeddings and
            names are stored only on this device, and disabling the feature
            deletes that data.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/settings')}
            className="mt-4 rounded-lg px-3 py-2"
          >
            Open Settings
          </Button>
        </div>
      )}

      {error && (
        <div
          className="mt-5 rounded-xl border border-[var(--border-default)] p-4 text-sm"
          role="alert"
        >
          <p>{error}</p>
          <button onClick={() => void loadPeople()} className="mt-2 underline">
            Retry loading
          </button>
        </div>
      )}
      {scanning && (
        <div
          className="mt-5 rounded-xl border border-[var(--border-default)] p-4"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm">
            Analyzing photos on this device · {progress.current} of{' '}
            {progress.total}
          </p>
          <progress
            className="mt-3 w-full accent-primary"
            max={Math.max(progress.total, 1)}
            value={progress.current}
          />
        </div>
      )}
      {scanMessage && (
        <p className="mt-5 text-sm text-[var(--text-secondary)]" role="status">
          {scanMessage}
        </p>
      )}

      {enabled && !scanning && groups.length === 0 && !error && (
        <div className="mt-6 rounded-2xl border border-[var(--border-default)] bg-[var(--glass-bg-1)] p-8 text-center">
          <h2 className="font-medium">No people found yet</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Scan your saved photo libraries to find faces and create local
            groups.
          </p>
          <Button
            size="sm"
            onClick={() => void scanLibrary()}
            className="mt-4 rounded-lg px-3 py-2"
          >
            Scan library
          </Button>
        </div>
      )}

      {groups.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => {
            const cover = group.photoPaths[0];
            return (
              <Card
                key={group.id}
                padding="p-0"
                rounded="xl"
                shadow="l1"
                className="overflow-hidden"
              >
                {cover && (
                  <img
                    src={`atlas-photo://${encodeFilePath(cover)}`}
                    alt="Example photo from this face group"
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-4">
                  <p className="text-xs text-[var(--text-secondary)]">
                    {group.photoPaths.length} photos · {group.faceCount}{' '}
                    detected faces
                  </p>
                  <label
                    className="mt-3 block text-xs text-[var(--text-secondary)]"
                    htmlFor={`person-name-${group.id}`}
                  >
                    Person name
                  </label>
                  <input
                    id={`person-name-${group.id}`}
                    value={names[group.id] ?? ''}
                    onChange={(event) =>
                      setNames((previous) => ({
                        ...previous,
                        [group.id]: event.target.value,
                      }))
                    }
                    placeholder="Add a name"
                    maxLength={60}
                    className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void saveName(group)}
                    className="mt-3 rounded-lg px-3 py-2"
                  >
                    Save name
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PeopleView;
