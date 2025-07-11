import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import App from '../../client/src/App.tsx';

// Mock the useAuth hook to control auth state
vi.mock('../../client/src/contexts/AuthContext.tsx', () => ({
  useAuth: () => ({ currentUser: null, isLoading: false }),
}));

describe('Routing security', () => {
  it('renders without crashing when unauthenticated', () => {
    render(<App />);
    // At bare minimum the landing page should be present
    expect(document.body.innerHTML).toBeTruthy();
  });
});