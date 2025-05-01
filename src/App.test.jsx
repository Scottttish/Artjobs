import { render, screen } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import App from './App';

describe('Компонент App', () => {
  test('отображает Header и Footer на всех маршрутах', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });
    render(
      <Router history={history}>
        <App />
      </Router>
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('отображает HomePage на маршруте "/"', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });
    render(
      <Router history={history}>
        <App />
      </Router>
    );
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  test('отображает ThreeDPage на маршруте "/3d"', () => {
    const history = createMemoryHistory({ initialEntries: ['/3d'] });
    render(
      <Router history={history}>
        <App />
      </Router>
    );
    expect(screen.getByTestId('threed-page')).toBeInTheDocument();
  });

  test('отображает MotionPage на маршруте "/motion"', () => {
    const history = createMemoryHistory({ initialEntries: ['/motion'] });
    render(
      <Router history={history}>
        <App />
      </Router>
    );
    expect(screen.getByTestId('motion-page')).toBeInTheDocument();
  });

  test('отображает IllustrationPage на маршруте "/illustration"', () => {
    const history = createMemoryHistory({ initialEntries: ['/illustration'] });
    render(
      <Router history={history}>
        <App />
      </Router>
    );
    expect(screen.getByTestId('illustration-page')).toBeInTheDocument();
  });

  test('отображает OtherPage на маршруте "/other"', () => {
    const history = createMemoryHistory({ initialEntries: ['/other'] });
    render(
      <Router history={history}>
        <App />
      </Router>
    );
    expect(screen.getByTestId('other-page')).toBeInTheDocument();
  });

  test('отображает ArtProfile на маршруте "/artprofile"', () => {
    const history = createMemoryHistory({ initialEntries: ['/artprofile'] });
    render(
      <Router history={history}>
        <App />
      </Router>
    );
    expect(screen.getByTestId('artprofile')).toBeInTheDocument();
  });

  test('отображает HirerProfile на маршруте "/hirerprofile"', () => {
    const history = createMemoryHistory({ initialEntries: ['/hirerprofile'] });
    render(
      <Router history={history}>
        <App />
      </Router>
    );
    expect(screen.getByTestId('hirerprofile')).toBeInTheDocument();
  });
});
