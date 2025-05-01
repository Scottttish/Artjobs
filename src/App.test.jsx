import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import Header from './components/Header/Header';
import HeroSection from './components/HeroSection/HeroSection';
import NewsSection from './components/NewsSection/NewsSection';
import ThreeDSection from './components/3DSection/3DSection';
import Footer from './components/Footer/Footer';
import ThreeDPage from './components/ThreeDPage/ThreeDPage';
import MotionPage from './components/MotionPage/MotionPage';
import IllustrationPage from './components/IllustrationPage/IllustrationPage';
import InteriorPage from './components/InteriorPage/InteriorPage';
import OtherPage from './components/OtherPage/OtherPage';
import ArtProfile from './components/ArtProfile/ArtProfile';
import HirerProfile from './components/HirerProfile/HirerProfile';

// Mock the components to avoid testing their internal logic
jest.mock('./components/Header/Header', () => () => <div>Header</div>);
jest.mock('./components/HeroSection/HeroSection', () => () => <div>HeroSection</div>);
jest.mock('./components/NewsSection/NewsSection', () => () => <div>NewsSection</div>);
jest.mock('./components/3DSection/3DSection', () => () => <div>ThreeDSection</div>);
jest.mock('./components/Footer/Footer', () => () => <div>Footer</div>);
jest.mock('./components/ThreeDPage/ThreeDPage', () => () => <div>ThreeDPage</div>);
jest.mock('./components/MotionPage/MotionPage', () => () => <div>MotionPage</div>);
jest.mock('./components/IllustrationPage/IllustrationPage', () => () => <div>IllustrationPage</div>);
jest.mock('./components/InteriorPage/InteriorPage', () => () => <div>InteriorPage</div>);
jest.mock('./components/OtherPage/OtherPage', () => () => <div>OtherPage</div>);
jest.mock('./components/ArtProfile/ArtProfile', () => () => <div>ArtProfile</div>);
jest.mock('./components/HirerProfile/HirerProfile', () => () => <div>HirerProfile</div>);

// Mock window.scrollTo and window.history.scrollRestoration
const scrollToMock = jest.fn();
window.scrollTo = scrollToMock;
Object.defineProperty(window.history, 'scrollRestoration', {
  value: 'manual',
  writable: true,
});

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Header and Footer on all routes', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  test('renders home page components on "/" route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('HeroSection')).toBeInTheDocument();
    expect(screen.getByText('NewsSection')).toBeInTheDocument();
    expect(screen.getByText('ThreeDSection')).toBeInTheDocument();
  });

  test('renders ThreeDPage on "/3d" route', () => {
    render(
      <MemoryRouter initialEntries={['/3d']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('ThreeDPage')).toBeInTheDocument();
    expect(screen.queryByText('HeroSection')).not.toBeInTheDocument();
  });

  test('renders MotionPage on "/motion" route', () => {
    render(
      <MemoryRouter initialEntries={['/motion']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('MotionPage')).toBeInTheDocument();
  });

  test('renders IllustrationPage on "/illustration" route', () => {
    render(
      <MemoryRouter initialEntries={['/illustration']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('IllustrationPage')).toBeInTheDocument();
  });

  test('renders InteriorPage on "/interior" route', () => {
    render(
      <MemoryRouter initialEntries={['/interior']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('InteriorPage')).toBeInTheDocument();
  });

  test('renders OtherPage on "/other" route', () => {
    render(
      <MemoryRouter initialEntries={['/other']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('OtherPage')).toBeInTheDocument();
  });

  test('renders ArtProfile on "/artprofile" route', () => {
    render(
      <MemoryRouter initialEntries={['/artprofile']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('ArtProfile')).toBeInTheDocument();
  });

  test('renders HirerProfile on "/hirerprofile" route', () => {
    render(
      <MemoryRouter initialEntries={['/hirerprofile']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('HirerProfile')).toBeInTheDocument();
  });

  test('ScrollToTop calls window.scrollTo on route change', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
  });

  test('ScrollToTop sets scrollRestoration to manual', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(window.history.scrollRestoration).toBe('manual');
  });
});
