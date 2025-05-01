import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ArtProfile from './ArtProfile';
import { createClient } from '@supabase/supabase-js';
 
jest.mock('@supabase/supabase-js', () => {
  const actual = jest.requireActual('@supabase/supabase-js');
  return {
    ...actual,
    createClient: jest.fn()
  };
});

const mockGetSession = jest.fn();
const mockFrom = jest.fn();

createClient.mockReturnValue({
  auth: {
    getSession: mockGetSession
  },
  from: mockFrom,
  channel: () => ({
    on: () => ({
      subscribe: () => ({})
    })
  }),
  removeChannel: jest.fn()
});

describe('ArtProfile', () => {
  test('Отображает приветствие и текущее время после загрузки данных пользователя', async () => {
    // Мокаем сессию
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-123' }
        }
      },
      error: null
    });

    // Мокаем запросы к таблицам
    mockFrom.mockImplementation((table) => {
      if (table === 'users') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: { username: 'Айжан', email: 'aizhan@example.com' },
                error: null
              })
            })
          })
        };
      }

      if (table === 'additionalinfo') {
        return {
          select: () => ({
            eq: () => Promise.resolve({
              data: [{
                drawinglevel: 'Продвинутый',
                preferredmedium: 'Цифровое',
                experienceyears: 5,
                portfoliolink: 'https://portfolio.example.com',
                artdescription: 'Портреты и пейзажи'
              }],
              error: null
            })
          })
        };
      }

      return {};
    });

    render(<ArtProfile />);

    await waitFor(() => {
      expect(screen.getByText(/Добро пожаловать, Айжан/)).toBeInTheDocument();
    });

    expect(screen.getByText((content) => content.includes('понедельник') || content.includes('вторник'))).toBeInTheDocument();
  });
});
