import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, within } from '@testing-library/react';
import PhotoGrid from '../PhotoGrid';
import type { Photo } from '../../../../shared/types/photo';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makePhotos = (count: number, startId = 1): Photo[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `photo-${startId + i}`,
    path: `/photos/photo-${startId + i}.jpg`,
    filename: `photo-${startId + i}.jpg`,
    metadata: {
      date: new Date(2024, 0, 1 + i).toISOString(),
    },
  }));

// Stub out PhotoCard to avoid thumbnail / IntersectionObserver logic
vi.mock('../PhotoCard', () => ({
  default: ({ photo }: { photo: Photo }) => (
    <div data-testid={`card-${photo.id}`}>{photo.id}</div>
  ),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PhotoGrid – visible count', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  // 1. Default behaviour – renders initialRenderCount (50) then loads more
  it('renders initialRenderCount (50) photos on first mount', () => {
    const photos = makePhotos(200);
    const { getAllByTestId } = render(<PhotoGrid photos={photos} groupBy="none" />);
    // 50 cards + the sentinel div (no testid) = 50 elements with testid
    expect(getAllByTestId(/^card-/)).toHaveLength(50);
  });

  // 2. initialVisibleCount prop is honoured
  it('uses initialVisibleCount when provided', () => {
    const photos = makePhotos(200);
    const { getAllByTestId } = render(
      <PhotoGrid photos={photos} groupBy="none" initialVisibleCount={120} />
    );
    expect(getAllByTestId(/^card-/)).toHaveLength(120);
  });

  // 3. visibleCount is clamped to photos.length when initial is too high
  it('clamps initialVisibleCount to photos.length', () => {
    const photos = makePhotos(30);
    const { getAllByTestId } = render(
      <PhotoGrid photos={photos} groupBy="none" initialVisibleCount={200} />
    );
    expect(getAllByTestId(/^card-/)).toHaveLength(30);
  });

  // 4. onVisibleCountChange is called with the initial count
  it('calls onVisibleCountChange with initial visible count', () => {
    const photos = makePhotos(200);
    const onChange = vi.fn();
    render(
      <PhotoGrid
        photos={photos}
        groupBy="none"
        initialVisibleCount={120}
        onVisibleCountChange={onChange}
      />
    );
    expect(onChange).toHaveBeenCalledWith(120);
  });

  // 5. Simulate view switch: mount → unmount → remount with cached count
  it('restores visibleCount from initialVisibleCount across remounts', () => {
    const photos = makePhotos(200);
    const onChange = vi.fn();

    // First mount – scroll to 120
    const { unmount } = render(
      <PhotoGrid
        photos={photos}
        groupBy="none"
        initialVisibleCount={120}
        onVisibleCountChange={onChange}
      />
    );
    expect(onChange).toHaveBeenLastCalledWith(120);
    unmount();

    onChange.mockClear();

    // Second mount – should start at 120 (from cache), not 50
    render(
      <PhotoGrid
        photos={photos}
        groupBy="none"
        initialVisibleCount={120}
        onVisibleCountChange={onChange}
      />
    );
    expect(onChange).toHaveBeenCalledWith(120);
  });

  // 6. When initialVisibleCount is NOT provided, defaults to 50
  it('defaults to 50 when no initialVisibleCount', () => {
    const photos = makePhotos(200);
    const onChange = vi.fn();
    render(
      <PhotoGrid
        photos={photos}
        groupBy="none"
        onVisibleCountChange={onChange}
      />
    );
    expect(onChange).toHaveBeenCalledWith(50);
  });

  // 7. Resets to 50 when photos change to a completely new collection
  it('resets to 50 when photos prop changes to a new collection (no cache)', () => {
    const photosA = makePhotos(200, 1);
    const photosB = makePhotos(300, 1000);

    const { rerender, getAllByTestId } = render(
      <PhotoGrid photos={photosA} groupBy="none" />
    );
    expect(getAllByTestId(/^card-/)).toHaveLength(50);

    // Simulate switching to a different album (no cache for it)
    rerender(<PhotoGrid photos={photosB} groupBy="none" />);
    expect(getAllByTestId(/^card-/)).toHaveLength(50);
  });

  // 8. Restores from cache when initialVisibleCount provided, even after
  //    the photos array changes (simulates setPhotos([]) → setPhotos(new))
  it('restores from cache after photos reload when initialVisibleCount is set', () => {
    const photos = makePhotos(200);
    const onChange = vi.fn();

    // Mount with cached count
    const { rerender } = render(
      <PhotoGrid
        photos={photos}
        groupBy="none"
        initialVisibleCount={150}
        onVisibleCountChange={onChange}
      />
    );
    expect(onChange).toHaveBeenLastCalledWith(150);

    // Simulate setPhotos([]) then setPhotos(photos) — same collection key pattern
    // First: empty photos (simulating clear)
    const emptyPhotos: Photo[] = [];
    rerender(
      <PhotoGrid
        photos={emptyPhotos}
        groupBy="none"
        initialVisibleCount={150}
        onVisibleCountChange={onChange}
      />
    );

    // Then: photos come back
    rerender(
      <PhotoGrid
        photos={photos}
        groupBy="none"
        initialVisibleCount={150}
        onVisibleCountChange={onChange}
      />
    );

    // Should restore to 150, not reset to 50
    expect(onChange).toHaveBeenLastCalledWith(150);
  });
});
