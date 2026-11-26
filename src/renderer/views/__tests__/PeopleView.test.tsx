import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PeopleView from '../PeopleView';

const { navigate, detectFaces, initializeFaceDetection } = vi.hoisted(() => ({
  navigate: vi.fn(),
  detectFaces: vi.fn(),
  initializeFaceDetection: vi.fn(),
}));

vi.mock('../../hooks/useMotionNavigate', () => ({
  useMotionNavigate: () => navigate,
}));
vi.mock('../../services/faceDetection', () => ({
  detectFaces,
  initializeFaceDetection,
}));

beforeEach(() => {
  vi.clearAllMocks();
  window.electronAPI.getFaceGroupingEnabled = vi.fn(async () => true);
  window.electronAPI.getPeopleGroups = vi.fn(async () => []);
  window.electronAPI.getLibraryPhotos = vi.fn(async () => []);
  window.electronAPI.getFaceScanQueue = vi.fn(async () => ({
    photos: [],
    total: 0,
    checked: 0,
    failed: 0,
  }));
  window.electronAPI.getPhotoThumbnailData = vi.fn(
    async () => new Uint8Array([1])
  );
  window.electronAPI.saveDetectedFaces = vi.fn(async () => null);
  window.electronAPI.recordFaceScanFailure = vi.fn(async () => undefined);
  window.electronAPI.renamePerson = vi.fn(async () => []);
  window.electronAPI.forgetPerson = vi.fn(async () => []);
  initializeFaceDetection.mockResolvedValue(undefined);
});

describe('PeopleView', () => {
  it('starts local indexing automatically when no people have been indexed yet', async () => {
    window.electronAPI.getFaceScanQueue = vi.fn(async () => ({
      photos: [
        { id: 'photo-1', path: '/library/one.jpg', filename: 'one.jpg' },
      ],
      total: 1,
      checked: 0,
      failed: 0,
    }));
    detectFaces.mockResolvedValue([]);
    let finishPreparation!: () => void;
    initializeFaceDetection.mockReturnValue(
      new Promise<void>((resolve) => {
        finishPreparation = resolve;
      })
    );

    render(<PeopleView />);

    expect(
      await screen.findByText('Preparing on-device face analysis…')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Preparing face analysis' })
    ).toBeInTheDocument();
    finishPreparation();
    expect(
      await screen.findByText(
        'Checked 1 photos. No new faces were found in those photos.'
      )
    ).toBeInTheDocument();
    expect(window.electronAPI.getFaceScanQueue).toHaveBeenCalledWith('new');
  });

  it('keeps indexing available when users explicitly turn grouping off', async () => {
    window.electronAPI.getFaceGroupingEnabled = vi.fn(async () => false);
    render(<PeopleView />);

    expect(
      await screen.findByRole('heading', { name: 'Face grouping is off' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open Settings' })
    ).toBeInTheDocument();
    expect(window.electronAPI.getFaceScanQueue).not.toHaveBeenCalled();
  });

  it('scans locally, reports progress, and preserves the safe empty result', async () => {
    window.electronAPI.getFaceScanQueue = vi.fn(async () => ({
      photos: [
        { id: 'photo-1', path: '/library/one.jpg', filename: 'one.jpg' },
      ],
      total: 1,
      checked: 0,
      failed: 0,
    }));
    detectFaces.mockResolvedValue([]);

    render(<PeopleView />);
    expect(
      await screen.findByText(
        'Checked 1 photos. No new faces were found in those photos.'
      )
    ).toBeInTheDocument();
    expect(initializeFaceDetection).toHaveBeenCalledOnce();
    expect(detectFaces).toHaveBeenCalledWith(
      '/library/one.jpg',
      new Uint8Array([1])
    );
    expect(window.electronAPI.saveDetectedFaces).toHaveBeenCalledWith(
      '/library/one.jpg',
      'photo-1',
      []
    );
    expect(screen.getByText('No people found yet')).toBeInTheDocument();
  });

  it('shows the saved empty result without initializing face analysis again', async () => {
    window.electronAPI.getFaceScanQueue = vi.fn(async () => ({
      photos: [],
      total: 12,
      checked: 12,
      failed: 0,
    }));

    render(<PeopleView />);

    expect(
      await screen.findByText(
        'All 12 photos have already been checked. Newly indexed or changed photos will be checked automatically.'
      )
    ).toBeInTheDocument();
    expect(initializeFaceDetection).not.toHaveBeenCalled();
    expect(detectFaces).not.toHaveBeenCalled();
  });

  it('offers an explicit retry for previously failed photos', async () => {
    const user = userEvent.setup();
    const photo = {
      id: 'photo-1',
      path: '/library/one.jpg',
      filename: 'one.jpg',
    };
    window.electronAPI.getFaceScanQueue = vi
      .fn()
      .mockResolvedValueOnce({ photos: [], total: 1, checked: 0, failed: 1 })
      .mockResolvedValueOnce({
        photos: [photo],
        total: 1,
        checked: 0,
        failed: 1,
      });
    detectFaces.mockResolvedValue([]);

    render(<PeopleView />);

    await user.click(
      await screen.findByRole('button', { name: 'Retry failed photos' })
    );

    expect(window.electronAPI.getFaceScanQueue).toHaveBeenLastCalledWith(
      'retry-failed'
    );
    expect(
      await screen.findByText(
        'Checked 1 photos. No new faces were found in those photos.'
      )
    ).toBeInTheDocument();
  });

  it('preserves the scan context and safely retries model preparation errors', async () => {
    const user = userEvent.setup();
    const photo = {
      id: 'photo-1',
      path: '/library/one.jpg',
      filename: 'one.jpg',
    };
    window.electronAPI.getFaceScanQueue = vi.fn(async () => ({
      photos: [photo],
      total: 1,
      checked: 0,
      failed: 0,
    }));
    initializeFaceDetection
      .mockRejectedValueOnce(new Error('model unavailable'))
      .mockResolvedValueOnce(undefined);
    detectFaces.mockResolvedValue([]);

    render(<PeopleView />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The library could not be scanned'
    );
    await user.click(
      within(screen.getByRole('alert')).getByRole('button', {
        name: 'Retry scan',
      })
    );

    expect(window.electronAPI.getFaceScanQueue).toHaveBeenLastCalledWith('new');
    expect(
      await screen.findByText(
        'Checked 1 photos. No new faces were found in those photos.'
      )
    ).toBeInTheDocument();
    expect(window.electronAPI.saveDetectedFaces).toHaveBeenCalledWith(
      photo.path,
      photo.id,
      []
    );
  });

  it('marks a stopped scan as paused and resumes only unchecked photos', async () => {
    const user = userEvent.setup();
    const firstPhoto = {
      id: 'photo-1',
      path: '/library/one.jpg',
      filename: 'one.jpg',
    };
    const secondPhoto = {
      id: 'photo-2',
      path: '/library/two.jpg',
      filename: 'two.jpg',
    };
    window.electronAPI.getFaceScanQueue = vi
      .fn()
      .mockResolvedValueOnce({
        photos: [firstPhoto, secondPhoto],
        total: 2,
        checked: 0,
        failed: 0,
      })
      .mockResolvedValueOnce({
        photos: [secondPhoto],
        total: 2,
        checked: 1,
        failed: 0,
      });
    let finishDetection!: () => void;
    detectFaces
      .mockReturnValueOnce(
        new Promise((resolve) => {
          finishDetection = () => resolve([]);
        })
      )
      .mockResolvedValueOnce([]);

    render(<PeopleView />);

    await waitFor(() => expect(detectFaces).toHaveBeenCalledOnce());
    await user.click(await screen.findByRole('button', { name: 'Stop scan' }));
    finishDetection();

    expect(
      await screen.findByText(
        'Stopped after 1 photos. Completed results are saved on this device.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Scan paused')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue scan' }));

    expect(window.electronAPI.getFaceScanQueue).toHaveBeenLastCalledWith('new');
    expect(
      await screen.findByText(
        'Checked 1 photos. No new faces were found in those photos.'
      )
    ).toBeInTheDocument();
    expect(detectFaces).toHaveBeenCalledTimes(2);
    expect(detectFaces).toHaveBeenLastCalledWith(
      secondPhoto.path,
      new Uint8Array([1])
    );
  });

  it('searches people and filters unnamed groups with a clear no-results path', async () => {
    const user = userEvent.setup();
    const groups = [
      {
        id: 'zoe',
        name: 'Zoe',
        photoPaths: ['/library/zoe-1.jpg', '/library/zoe-2.jpg'],
        faceCount: 2,
      },
      {
        id: 'unnamed-1',
        name: '',
        photoPaths: ['/library/unnamed-1.jpg'],
        faceCount: 1,
      },
      {
        id: 'unnamed-2',
        name: '',
        photoPaths: ['/library/unnamed-2.jpg'],
        faceCount: 1,
      },
    ];
    window.electronAPI.getPeopleGroups = vi.fn(async () => groups);
    window.electronAPI.getFaceScanQueue = vi.fn(async () => ({
      photos: [],
      total: 4,
      checked: 4,
      failed: 0,
    }));

    render(<PeopleView />);

    await user.click(await screen.findByRole('button', { name: 'Unnamed' }));
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.queryByRole('article', { name: 'Zoe, 2 photos' })).toBeNull();

    await user.type(
      screen.getByRole('searchbox', { name: 'Search people' }),
      'Ada'
    );
    expect(
      await screen.findByText('No people match your search')
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show all people' }));
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(
      screen.getByRole('searchbox', { name: 'Search people' })
    ).toHaveValue('');
  });

  it('sorts people by name and switches between grid and list layouts', async () => {
    const user = userEvent.setup();
    window.electronAPI.getPeopleGroups = vi.fn(async () => [
      {
        id: 'zoe',
        name: 'Zoe',
        photoPaths: ['/library/zoe-1.jpg', '/library/zoe-2.jpg'],
        faceCount: 2,
      },
      {
        id: 'unnamed',
        name: '',
        photoPaths: ['/library/unnamed.jpg'],
        faceCount: 1,
      },
      {
        id: 'ada',
        name: 'Ada',
        photoPaths: ['/library/ada.jpg'],
        faceCount: 1,
      },
    ]);
    window.electronAPI.getFaceScanQueue = vi.fn(async () => ({
      photos: [],
      total: 4,
      checked: 4,
      failed: 0,
    }));

    render(<PeopleView />);

    expect(
      await screen.findByRole('article', { name: 'Zoe, 2 photos' })
    ).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Sort people'), 'name');
    expect(
      screen
        .getAllByRole('article')
        .map((item) => item.getAttribute('aria-label'))
    ).toEqual(['Ada, 1 photo', 'Zoe, 2 photos', 'Unnamed person, 1 photo']);

    await user.click(screen.getByRole('button', { name: 'List view' }));
    expect(screen.getByRole('button', { name: 'List view' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(document.querySelector('[data-view="list"]')).toBeInTheDocument();
  });

  it('renames and forgets a group without touching its original photos', async () => {
    const user = userEvent.setup();
    const originalGroup = {
      id: 'person-1',
      name: 'Alex',
      photoPaths: ['/library/alex.jpg'],
      faceCount: 1,
    };
    const renamedGroup = { ...originalGroup, name: 'Taylor' };
    window.electronAPI.getPeopleGroups = vi.fn(async () => [originalGroup]);
    window.electronAPI.getFaceScanQueue = vi.fn(async () => ({
      photos: [],
      total: 1,
      checked: 1,
      failed: 0,
    }));
    window.electronAPI.renamePerson = vi.fn(async () => [renamedGroup]);
    window.electronAPI.forgetPerson = vi.fn(async () => []);

    render(<PeopleView />);

    await user.click(
      await screen.findByRole('button', { name: 'Rename Alex' })
    );
    const nameInput = screen.getByLabelText('Person name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Taylor');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      await screen.findByRole('article', { name: 'Taylor, 1 photo' })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Forget Taylor group' })
    );
    expect(window.electronAPI.forgetPerson).toHaveBeenCalledWith('person-1');
    expect(
      await screen.findByText(
        'Taylor forgotten. Original photos are unchanged; a full rescan can find this group again.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'No people found yet' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('article', { name: 'Taylor, 1 photo' })
    ).toBeNull();
  });

  it('keeps the name editor stable while a rename is being saved', async () => {
    const user = userEvent.setup();
    const originalGroup = {
      id: 'person-1',
      name: 'Alex',
      photoPaths: ['/library/alex.jpg'],
      faceCount: 1,
    };
    const renamedGroups = [{ ...originalGroup, name: 'Taylor' }];
    let completeSave!: (groups: typeof renamedGroups) => void;
    const savePromise = new Promise<typeof renamedGroups>((resolve) => {
      completeSave = resolve;
    });
    window.electronAPI.getPeopleGroups = vi.fn(async () => [originalGroup]);
    window.electronAPI.getFaceScanQueue = vi.fn(async () => ({
      photos: [],
      total: 1,
      checked: 1,
      failed: 0,
    }));
    window.electronAPI.renamePerson = vi.fn(() => savePromise);

    render(<PeopleView />);

    await user.click(
      await screen.findByRole('button', { name: 'Rename Alex' })
    );
    const input = screen.getByLabelText('Person name');
    await user.clear(input);
    await user.type(input, 'Taylor');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      await screen.findByRole('button', { name: 'Saving name…' })
    ).toBeDisabled();
    expect(input).toBeDisabled();

    completeSave(renamedGroups);

    expect(
      await screen.findByRole('article', { name: 'Taylor, 1 photo' })
    ).toBeInTheDocument();
  });

  it('preserves the draft and permits retry when a name save fails', async () => {
    const user = userEvent.setup();
    const originalGroup = {
      id: 'person-1',
      name: 'Alex',
      photoPaths: ['/library/alex.jpg'],
      faceCount: 1,
    };
    const renamedGroup = { ...originalGroup, name: 'Taylor' };
    window.electronAPI.getPeopleGroups = vi.fn(async () => [originalGroup]);
    window.electronAPI.getFaceScanQueue = vi.fn(async () => ({
      photos: [],
      total: 1,
      checked: 1,
      failed: 0,
    }));
    window.electronAPI.renamePerson = vi
      .fn()
      .mockRejectedValueOnce(new Error('storage unavailable'))
      .mockResolvedValueOnce([renamedGroup]);

    render(<PeopleView />);

    await user.click(
      await screen.findByRole('button', { name: 'Rename Alex' })
    );
    const input = screen.getByLabelText('Person name');
    await user.clear(input);
    await user.type(input, 'Taylor');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The name for Alex could not be saved'
    );
    expect(input).toHaveValue('Taylor');

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      await screen.findByRole('article', { name: 'Taylor, 1 photo' })
    ).toBeInTheDocument();
  });

  it('shows an actionable retry when the people index cannot be loaded', async () => {
    window.electronAPI.getFaceGroupingEnabled = vi.fn(async () => {
      throw new Error('storage unavailable');
    });
    render(<PeopleView />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'People data could not be loaded'
    );
    expect(
      screen.getByRole('button', { name: 'Retry loading' })
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(window.electronAPI.getFaceGroupingEnabled).toHaveBeenCalledOnce()
    );
  });
});
