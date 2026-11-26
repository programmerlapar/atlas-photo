import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Grid2X2,
  List,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react';
import { useMotionNavigate } from '../hooks/useMotionNavigate';
import type { FaceScanMode, PersonGroup } from '../../shared/types/people';
import {
  detectFaces,
  initializeFaceDetection,
} from '../services/faceDetection';
import { encodeFilePath } from '../utils/photoId';
import { Button, Card } from '../components/ui';
import { Toolbar } from '../components/layout';

const PeopleView = () => {
  const navigate = useMotionNavigate();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [groups, setGroups] = useState<PersonGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [pausedScanMode, setPausedScanMode] = useState<FaceScanMode | null>(
    null
  );
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [failedScanCount, setFailedScanCount] = useState(0);
  const [hasIndexedPhotos, setHasIndexedPhotos] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanError, setScanError] = useState(false);
  const [names, setNames] = useState<Record<string, string>>({});
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [peopleFilter, setPeopleFilter] = useState<'all' | 'unnamed'>('all');
  const [sortBy, setSortBy] = useState<'most' | 'fewest' | 'name'>('most');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [savingNameId, setSavingNameId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});
  const [failedCovers, setFailedCovers] = useState<Record<string, boolean>>({});
  const cancelled = useRef(false);
  const autoScanStarted = useRef(false);
  const savingNameRef = useRef<string | null>(null);

  const loadPeople = async () => {
    setError(null);
    setScanError(false);
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

  const scanLibrary = useCallback(
    async (mode: FaceScanMode = 'new') => {
      if (!enabled || scanning) return;
      setError(null);
      setScanError(false);
      setPausedScanMode(null);
      setScanMessage(null);
      setScanning(true);
      setPreparing(false);
      cancelled.current = false;
      try {
        const queue = await window.electronAPI.getFaceScanQueue(mode);
        const { photos } = queue;
        setHasIndexedPhotos(queue.total > 0);
        setFailedScanCount(queue.failed);
        setProgress({ current: 0, total: photos.length });
        if (photos.length === 0) {
          if (queue.total === 0) {
            setScanMessage(
              'No photos are indexed in your saved libraries yet. Open an album, then try again.'
            );
          } else if (mode === 'new' && queue.failed > 0) {
            setScanMessage(
              `All ${queue.total} photos have been checked; ${queue.failed} could not be analyzed. Retry those photos when ready.`
            );
          } else if (queue.checked === queue.total) {
            setScanMessage(
              `All ${queue.total} photos have already been checked. Newly indexed or changed photos will be checked automatically.`
            );
          } else {
            setScanMessage('There are no photos to scan in this selection.');
          }
          return;
        }

        if (cancelled.current) {
          setPausedScanMode(mode);
          setScanMessage(
            'Scan stopped before any photos were checked. Existing results are saved on this device.'
          );
          return;
        }

        setPreparing(true);
        await initializeFaceDetection();
        setPreparing(false);
        if (cancelled.current) {
          setPausedScanMode(mode);
          setScanMessage(
            'Scan stopped before photo analysis began. Existing results are saved on this device.'
          );
          return;
        }

        let failed = 0;
        let processed = 0;
        let resultGroups: PersonGroup[] | null = null;
        for (const photo of photos) {
          if (cancelled.current) break;
          try {
            const thumbnail = await window.electronAPI.getPhotoThumbnailData(
              photo.path
            );
            if (!thumbnail) throw new Error('Preview unavailable');
            const faces = await detectFaces(photo.path, thumbnail);
            const updatedGroups = await window.electronAPI.saveDetectedFaces(
              photo.path,
              photo.id,
              faces
            );
            if (updatedGroups) {
              resultGroups = updatedGroups;
              setGroups(updatedGroups);
            }
            processed++;
          } catch {
            failed++;
            await window.electronAPI
              .recordFaceScanFailure(photo.path, photo.id)
              .catch(() => undefined);
          }
          setProgress({ current: processed + failed, total: photos.length });
        }

        if (cancelled.current) {
          setPausedScanMode(mode);
          setFailedScanCount(
            mode === 'all'
              ? failed
              : mode === 'retry-failed'
                ? Math.max(0, queue.failed - processed) + failed
                : queue.failed + failed
          );
          setScanMessage(
            `Stopped after ${processed} photos. Completed results are saved on this device.`
          );
        } else if (failed > 0) {
          setFailedScanCount(
            mode === 'all'
              ? failed
              : mode === 'retry-failed'
                ? Math.max(0, queue.failed - processed) + failed
                : queue.failed + failed
          );
          setScanMessage(
            `Checked ${processed} photos; ${failed} could not be analyzed. Their results are saved so you can retry only those photos.`
          );
        } else {
          setFailedScanCount(
            mode === 'all'
              ? 0
              : mode === 'retry-failed'
                ? Math.max(0, queue.failed - processed)
                : queue.failed
          );
          setScanMessage(
            resultGroups
              ? `Checked ${processed} photos. People groups are updated below.`
              : `Checked ${processed} photos. No new faces were found in those photos.`
          );
        }
      } catch {
        setPreparing(false);
        setScanError(true);
        setError(
          'The library could not be scanned. Your existing people groups are preserved; try again.'
        );
      } finally {
        setScanning(false);
        cancelled.current = false;
      }
    },
    [enabled, scanning]
  );

  useEffect(() => {
    if (enabled && !loading && !autoScanStarted.current) {
      autoScanStarted.current = true;
      void scanLibrary('new');
    }
  }, [enabled, loading, scanLibrary]);

  const visibleGroups = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return groups
      .filter((group) => {
        const name = group.name.trim();
        if (peopleFilter === 'unnamed' && name) return false;
        return !query || name.toLocaleLowerCase().includes(query);
      })
      .sort((left, right) => {
        if (sortBy === 'name') {
          const leftName = left.name.trim();
          const rightName = right.name.trim();
          if (!leftName && rightName) return 1;
          if (leftName && !rightName) return -1;
          return leftName.localeCompare(rightName, undefined, {
            sensitivity: 'base',
          });
        }
        const photoDifference =
          left.photoPaths.length - right.photoPaths.length;
        if (photoDifference !== 0) {
          return sortBy === 'most' ? -photoDifference : photoDifference;
        }
        return (left.name || '').localeCompare(right.name || '', undefined, {
          sensitivity: 'base',
        });
      });
  }, [groups, peopleFilter, searchQuery, sortBy]);

  const faceScanActionMode: FaceScanMode =
    pausedScanMode ?? (failedScanCount > 0 ? 'retry-failed' : 'all');
  const faceScanActionLabel =
    faceScanActionMode === 'new'
      ? 'Continue scan'
      : faceScanActionMode === 'retry-failed'
        ? 'Retry failed photos'
        : 'Rescan all';

  const saveName = async (group: PersonGroup) => {
    if (savingNameRef.current === group.id) return;
    savingNameRef.current = group.id;
    setSavingNameId(group.id);
    try {
      const updatedGroups = await window.electronAPI.renamePerson(
        group.id,
        names[group.id] ?? ''
      );
      setGroups(updatedGroups);
      setNames(
        Object.fromEntries(updatedGroups.map((item) => [item.id, item.name]))
      );
      setEditingPersonId(null);
      setNotice('Person name saved.');
      setActionErrors((previous) => {
        const next = { ...previous };
        delete next[group.id];
        return next;
      });
    } catch {
      setActionErrors((previous) => ({
        ...previous,
        [group.id]: `The name for ${group.name || 'this person'} could not be saved. Try again.`,
      }));
    } finally {
      savingNameRef.current = null;
      setSavingNameId(null);
    }
  };

  const forgetPerson = async (group: PersonGroup) => {
    try {
      const updatedGroups = await window.electronAPI.forgetPerson(group.id);
      setGroups(updatedGroups);
      setNames(
        Object.fromEntries(updatedGroups.map((item) => [item.id, item.name]))
      );
      if (editingPersonId === group.id) setEditingPersonId(null);
      setActionErrors((previous) => {
        const next = { ...previous };
        delete next[group.id];
        return next;
      });
      setNotice(
        `${group.name || 'Person group'} forgotten. Original photos are unchanged; a full rescan can find this group again.`
      );
    } catch {
      setActionErrors((previous) => ({
        ...previous,
        [group.id]: `Could not forget ${group.name || 'this group'}. Its photos are unchanged; try again.`,
      }));
    }
  };

  const cancelRename = (group: PersonGroup) => {
    setNames((previous) => ({ ...previous, [group.id]: group.name }));
    setEditingPersonId(null);
    setActionErrors((previous) => {
      const next = { ...previous };
      delete next[group.id];
      return next;
    });
  };

  const renderPersonActions = (group: PersonGroup, overlay = false) => (
    <div
      className={
        overlay
          ? 'people-avatar-actions flex gap-1 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] p-1 shadow-l2'
          : 'flex items-center gap-1'
      }
    >
      <button
        type="button"
        onClick={() => {
          setActionErrors((previous) => {
            const next = { ...previous };
            delete next[group.id];
            return next;
          });
          setNames((previous) => ({ ...previous, [group.id]: group.name }));
          setEditingPersonId(group.id);
        }}
        aria-label={`Rename ${group.name || 'unnamed person'}`}
        title="Rename person"
        className="people-person-action"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => void forgetPerson(group)}
        aria-label={`Forget ${group.name || 'unnamed person'} group`}
        title="Forget group; original photos stay untouched"
        className="people-person-action people-person-action-danger"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );

  const renderPersonIdentity = (group: PersonGroup, align = 'text-center') => {
    const displayName = group.name.trim() || 'Add name';
    const photoCount = group.photoPaths.length;
    const isSavingName = savingNameId === group.id;
    return editingPersonId === group.id ? (
      <form
        className={`w-full ${align === 'text-center' ? 'mx-auto max-w-[220px]' : ''}`}
        onSubmit={(event) => {
          event.preventDefault();
          void saveName(group);
        }}
      >
        <label className="sr-only" htmlFor={`person-name-${group.id}`}>
          Person name
        </label>
        <input
          id={`person-name-${group.id}`}
          autoFocus
          value={names[group.id] ?? ''}
          disabled={isSavingName}
          onChange={(event) =>
            setNames((previous) => ({
              ...previous,
              [group.id]: event.target.value,
            }))
          }
          placeholder="Add a name"
          maxLength={60}
          className="w-full rounded-sm border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div
          className={`mt-6 flex gap-3 ${align === 'text-center' ? 'justify-center' : ''}`}
        >
          <Button type="submit" size="sm" disabled={isSavingName}>
            {isSavingName ? 'Saving name…' : 'Save'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isSavingName}
            onClick={() => cancelRename(group)}
          >
            Cancel
          </Button>
        </div>
      </form>
    ) : (
      <div className={align}>
        <p className="truncate text-[15px] font-semibold text-[var(--text-primary)]">
          {displayName}
        </p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className="albums-view people-view"
        onScroll={(event) =>
          setIsHeaderScrolled(event.currentTarget.scrollTop > 12)
        }
      >
        <Toolbar
          title="People"
          subtitle="Loading your people groups"
          overlay
          isScrolled={isHeaderScrolled}
        />
        <div className="albums-content">
          <Card
            variant="custom-glass"
            padding="p-6"
            shadow="none"
            rounded="md"
            role="status"
          >
            Loading your people groups…
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className="albums-view people-view"
      onScroll={(event) =>
        setIsHeaderScrolled(event.currentTarget.scrollTop > 12)
      }
    >
      <Toolbar
        title="People"
        subtitle={
          enabled
            ? 'Groups of the same person in your photos'
            : 'Face grouping is off'
        }
        overlay
        isScrolled={isHeaderScrolled}
        actions={
          enabled && !error ? (
            <div className="flex items-center gap-2">
              {scanning ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    cancelled.current = true;
                  }}
                >
                  Stop scan
                </Button>
              ) : (
                <>
                  {hasIndexedPhotos && (
                    <span
                      className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium sm:inline-flex ${
                        failedScanCount > 0 || pausedScanMode !== null
                          ? 'border-[color-mix(in_srgb,var(--color-warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--text-primary)]'
                          : 'border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--text-primary)]'
                      }`}
                    >
                      {failedScanCount > 0 || pausedScanMode !== null ? (
                        <AlertTriangle
                          className="h-3.5 w-3.5 text-[var(--color-warning)]"
                          aria-hidden="true"
                        />
                      ) : (
                        <CheckCircle2
                          className="h-3.5 w-3.5 text-[var(--color-success)]"
                          aria-hidden="true"
                        />
                      )}
                      {pausedScanMode !== null
                        ? 'Scan paused'
                        : failedScanCount > 0
                          ? `${failedScanCount} need attention`
                          : 'Scan complete'}
                    </span>
                  )}
                  {hasIndexedPhotos && (
                    <Button
                      variant={
                        faceScanActionMode === 'all' ? 'secondary' : 'primary'
                      }
                      size="sm"
                      onClick={() => void scanLibrary(faceScanActionMode)}
                    >
                      <span className="inline-flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        {faceScanActionLabel}
                      </span>
                    </Button>
                  )}
                </>
              )}
            </div>
          ) : undefined
        }
      />

      <main className="albums-content people-content">
        {enabled && groups.length > 0 && (
          <div className="people-overview">
            <span className="rounded-full border border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]">
              {groups.length} {groups.length === 1 ? 'person' : 'people'}
            </span>
            {scanMessage && (
              <p
                className="text-sm text-[var(--text-secondary)]"
                role="status"
                aria-live="polite"
              >
                {scanMessage}
              </p>
            )}
          </div>
        )}

        {!enabled && (
          <Card
            variant="custom-glass"
            padding="p-6"
            shadow="l1"
            rounded="md"
            className="max-w-xl"
          >
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Face grouping is off
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Turn it on in Settings to group faces. Face data stays on this
              device; turning grouping off deletes saved face data.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/settings')}
              className="mt-4"
            >
              Open Settings
            </Button>
          </Card>
        )}

        {error && (
          <Card
            variant="custom-glass"
            padding="p-4"
            shadow="none"
            rounded="md"
            className="max-w-xl"
            role="alert"
          >
            <p className="text-sm text-[var(--text-primary)]">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                scanError
                  ? void scanLibrary(
                      failedScanCount > 0 ? 'retry-failed' : 'new'
                    )
                  : void loadPeople()
              }
              className="mt-3"
            >
              {scanError ? 'Retry scan' : 'Retry loading'}
            </Button>
          </Card>
        )}

        {scanning && (
          <Card
            variant="custom-glass"
            padding="p-4"
            shadow="none"
            rounded="md"
            className="max-w-2xl"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {preparing
                ? 'Preparing on-device face analysis…'
                : `Checking photos for faces · ${progress.current} of ${progress.total}`}
            </p>
            {preparing ? (
              <progress
                className="mt-3 w-full accent-primary"
                aria-label="Preparing face analysis"
              />
            ) : (
              <>
                <progress
                  className="mt-3 w-full accent-primary"
                  max={Math.max(progress.total, 1)}
                  value={progress.current}
                  aria-label="Face indexing progress"
                />
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {progress.total > 0
                    ? `${Math.round((progress.current / progress.total) * 100)}% complete · Results are saved as each photo is checked.`
                    : 'Checking your saved photo libraries…'}
                </p>
              </>
            )}
          </Card>
        )}

        {scanMessage && (!enabled || groups.length === 0) && (
          <p
            className="people-scan-message text-sm text-[var(--text-secondary)]"
            role="status"
            aria-live="polite"
          >
            {scanMessage}
          </p>
        )}

        {notice && (
          <p
            className="text-sm text-[var(--text-secondary)]"
            role="status"
            aria-live="polite"
          >
            {notice}
          </p>
        )}

        {enabled && !scanning && groups.length === 0 && !error && (
          <Card
            variant="custom-glass"
            padding="p-10"
            shadow="l2"
            rounded="md"
            className="mx-auto max-w-lg text-center"
          >
            <UsersRound className="mx-auto h-12 w-12 text-[var(--text-tertiary)]" />
            <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
              No people found yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
              {hasIndexedPhotos
                ? 'Face scan results are saved on this device. Newly indexed or changed photos are checked automatically.'
                : 'Open a saved photo library to begin. Indexed photos are checked on this device.'}
            </p>
          </Card>
        )}

        {enabled && groups.length > 0 && (
          <section className="people-library-section">
            <div className="people-controls flex flex-wrap items-center gap-3">
              <label className="people-search relative min-w-[220px] flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search people"
                  aria-label="Search people"
                  className="w-full rounded-full border border-[var(--photos-control-border)] bg-[var(--photos-control-bg)] py-2.5 pl-10 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-tertiary)] hover:bg-[var(--photos-control-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </label>

              <div
                className="inline-flex shrink-0 rounded-full border border-[var(--photos-control-border)] bg-[var(--photos-control-bg)] p-1"
                role="group"
                aria-label="Filter people"
              >
                <button
                  type="button"
                  aria-pressed={peopleFilter === 'all'}
                  onClick={() => setPeopleFilter('all')}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    peopleFilter === 'all'
                      ? 'bg-[var(--color-primary)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  All people
                </button>
                <button
                  type="button"
                  aria-pressed={peopleFilter === 'unnamed'}
                  onClick={() => setPeopleFilter('unnamed')}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    peopleFilter === 'unnamed'
                      ? 'bg-[var(--color-primary)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Unnamed
                </button>
              </div>

              <div className="flex w-full items-center justify-between gap-3 sm:ml-auto sm:w-auto sm:justify-end">
                <label className="sr-only" htmlFor="people-sort">
                  Sort people
                </label>
                <select
                  id="people-sort"
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value as typeof sortBy)
                  }
                  className="min-w-0 rounded-full border border-[var(--photos-control-border)] bg-[var(--photos-control-bg)] px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="most">Sort: Most photos</option>
                  <option value="fewest">Sort: Fewest photos</option>
                  <option value="name">Sort: Name A–Z</option>
                </select>
                <div
                  className="inline-flex shrink-0 rounded-full border border-[var(--photos-control-border)] bg-[var(--photos-control-bg)] p-1"
                  role="group"
                  aria-label="People layout"
                >
                  <button
                    type="button"
                    aria-label="Grid view"
                    aria-pressed={viewMode === 'grid'}
                    onClick={() => setViewMode('grid')}
                    className={`flex h-8 w-9 items-center justify-center rounded-full ${
                      viewMode === 'grid'
                        ? 'bg-[var(--photos-selected-bg)] text-[var(--color-primary)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Grid2X2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="List view"
                    aria-pressed={viewMode === 'list'}
                    onClick={() => setViewMode('list')}
                    className={`flex h-8 w-9 items-center justify-center rounded-full ${
                      viewMode === 'list'
                        ? 'bg-[var(--photos-selected-bg)] text-[var(--color-primary)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <List className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {visibleGroups.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                    : 'space-y-3'
                }
                data-view={viewMode}
              >
                {visibleGroups.map((group) => {
                  const cover = group.photoPaths[0];
                  const name = group.name.trim() || 'Unnamed person';
                  const photoCount = group.photoPaths.length;
                  const avatar = (
                    <div
                      className={`relative shrink-0 overflow-hidden rounded-full border border-[var(--photos-divider)] bg-[var(--photos-control-bg)] ${
                        viewMode === 'grid'
                          ? 'mx-auto mb-5 aspect-square w-32 sm:w-36 xl:w-44 2xl:w-48'
                          : 'h-16 w-16'
                      }`}
                    >
                      {cover && !failedCovers[group.id] ? (
                        <img
                          src={`atlas-photo://${encodeFilePath(cover)}`}
                          alt={`${name} photo`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={() =>
                            setFailedCovers((previous) => ({
                              ...previous,
                              [group.id]: true,
                            }))
                          }
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[var(--text-tertiary)]">
                          <UsersRound className="h-8 w-8" aria-hidden="true" />
                        </div>
                      )}
                      {viewMode === 'grid' &&
                        editingPersonId !== group.id &&
                        renderPersonActions(group, true)}
                    </div>
                  );

                  return (
                    <article
                      key={group.id}
                      className={`people-person-tile min-w-0 ${
                        viewMode === 'grid'
                          ? 'px-1 text-center'
                          : 'flex items-center gap-4 rounded-xl border border-[var(--photos-divider)] bg-[var(--photos-control-bg)] p-3'
                      }`}
                      aria-label={`${name}, ${photoCount} ${photoCount === 1 ? 'photo' : 'photos'}`}
                      data-person-name={name}
                    >
                      {avatar}
                      <div
                        className={
                          viewMode === 'grid' ? 'min-w-0' : 'min-w-0 flex-1'
                        }
                      >
                        {renderPersonIdentity(
                          group,
                          viewMode === 'grid' ? 'text-center' : 'text-left'
                        )}
                        {actionErrors[group.id] && (
                          <p
                            className="mt-2 text-xs text-[var(--color-warning)]"
                            role="alert"
                          >
                            {actionErrors[group.id]}
                          </p>
                        )}
                      </div>
                      {viewMode === 'list' && editingPersonId !== group.id && (
                        <div className="flex shrink-0 items-center gap-1">
                          {renderPersonActions(group)}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mx-auto max-w-lg py-12 text-center" role="status">
                <UsersRound
                  className="mx-auto h-10 w-10 text-[var(--text-tertiary)]"
                  aria-hidden="true"
                />
                <h2 className="mt-3 text-base font-semibold text-[var(--text-primary)]">
                  {searchQuery.trim()
                    ? 'No people match your search'
                    : 'No unnamed people'}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {searchQuery.trim()
                    ? 'Try another name or clear your search.'
                    : 'All detected people have names.'}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setPeopleFilter('all');
                  }}
                  className="mt-4"
                >
                  Show all people
                </Button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default PeopleView;
