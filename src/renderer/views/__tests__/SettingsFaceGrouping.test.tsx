import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsView from '../SettingsView';

beforeEach(() => {
  vi.clearAllMocks();
  window.electronAPI.getFaceGroupingEnabled = vi.fn(async () => true);
  window.electronAPI.setFaceGroupingEnabled = vi.fn(async (enabled) => enabled);
  window.electronAPI.getRecentDirectories = vi.fn(async () => []);
});

describe('Settings face grouping preference', () => {
  it('shows face grouping enabled by default and offers privacy controls', async () => {
    render(
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>
    );

    const preference = await screen.findByRole('checkbox', {
      name: 'Group similar faces in your library',
    });
    expect(preference).toBeChecked();
    expect(window.electronAPI.setFaceGroupingEnabled).not.toHaveBeenCalled();

    fireEvent.click(preference);

    await waitFor(() => expect(preference).not.toBeChecked());
    expect(window.electronAPI.setFaceGroupingEnabled).toHaveBeenCalledWith(
      false
    );
    expect(
      screen.getByText(/Turning this off deletes locally stored face groups/)
    ).toBeInTheDocument();
  });
});
