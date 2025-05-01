import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';

describe('AppRoutes Component', () => {
  test('renders Header and Footer on all routes', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('renders home page components on "/" route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  test('renders ThreeDPage on "/3d" route', () => {
    render(
      <MemoryRouter initialEntries={['/3d']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('threed-page')).toBeInTheDocument();
  });

  test('renders MotionPage on "/motion" route', () => {
    render(
      <MemoryRouter initialEntries={['/motion']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('motion-page')).toBeInTheDocument();
  });

  test('renders IllustrationPage on "/illustration" route', () => {
    render(
      <MemoryRouter initialEntries={['/illustration']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('illustration-page')).toBeInTheDocument();
  });

  test('renders OtherPage on "/other" route', () => {
    render(
      <MemoryRouter initialEntries={['/other']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('other-page')).toBeInTheDocument();
  });

  test('renders ArtProfile on "/artprofile" route', () => {
    render(
      <MemoryRouter initialEntries={['/artprofile']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('artprofile')).toBeInTheDocument();
  });

  test('renders HirerProfile on "/hirerprofile" route', () => {
    render(
      <MemoryRouter initialEntries={['/hirerprofile']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('hirerprofile')).toBeInTheDocument();
  });

  // Update ScrollToTop tests if needed
});
