import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsView from '../SettingsView';

beforeEach(() => {
  vi.clearAllMocks();
  window.electronAPI.getFaceGroupingEnabled = vi.fn(async () => false);
  window.electronAPI.setFaceGroupingEnabled = vi.fn(async (enabled) => enabled);
  window.electronAPI.getRecentDirectories = vi.fn(async () => []);
});

describe('Settings face grouping preference', () => {
  it('requires an explicit enable action before face data can be stored', async () => {
    render(
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>
    );

    const preference = await screen.findByRole('checkbox', {
      name: 'Enable face grouping and local face-data storage',
    });
    expect(preference).not.toBeChecked();
    expect(window.electronAPI.setFaceGroupingEnabled).not.toHaveBeenCalled();

    fireEvent.click(preference);

    await waitFor(() => expect(preference).toBeChecked());
    expect(window.electronAPI.setFaceGroupingEnabled).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'Open People' })).toBeInTheDocument();
  });
});
