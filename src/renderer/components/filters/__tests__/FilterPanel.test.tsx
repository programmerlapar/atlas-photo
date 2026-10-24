import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterPanel from '../FilterPanel';
import { useFilterStore } from '../../../stores/filterStore';

describe('FilterPanel search', () => {
  beforeEach(() => {
    useFilterStore.setState({ searchQuery: '' });
  });

  it('updates the filter search query when text is entered', async () => {
    const user = userEvent.setup();

    render(<FilterPanel onClose={() => {}} />);

    await user.type(
      screen.getByRole('searchbox', { name: 'Search photos' }),
      'beach'
    );

    expect(useFilterStore.getState().searchQuery).toBe('beach');
  });
});
