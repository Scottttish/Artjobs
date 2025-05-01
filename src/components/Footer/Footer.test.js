import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Компонент Footer', () => {
  test('Отображает контактную информацию', () => {
    render(<Footer />);
    expect(screen.getByText(/Астана, Казахстан/i)).toBeInTheDocument();
    expect(screen.getByText(/\+7 700 555 35 35/i)).toBeInTheDocument();
    expect(screen.getByText(/scotthouston314@gmail.com/i)).toBeInTheDocument();
  });

});
