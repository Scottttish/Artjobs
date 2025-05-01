import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ArtProfile from './ArtProfile';

jest.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() =>
        Promise.resolve({
          data: {
            session: {
              user: {
                id: 'test-user-id'
              }
            }
          },
          error: null
        })
      )
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: {
                full_name: 'Айжан',
                email: 'aizhan@example.com'
              },
              error: null
            })
        })
      })
    })
  }
}));

describe('ArtProfile', () => {
  it('отображает имя и email пользователя из профиля', async () => {
    render(<ArtProfile />);

    await waitFor(() => {
      expect(screen.getByText(/Добро пожаловать, Айжан/i)).toBeInTheDocument();
      expect(screen.getByText(/Email: aizhan@example.com/i)).toBeInTheDocument();
    });
  });
});
