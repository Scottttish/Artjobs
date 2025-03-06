import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders Рандомайзер header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Рандомайзер/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders input fields and button', () => {
  render(<App />);
  
  const firstInput = screen.getByPlaceholderText(/Введите первое число/i);
  const secondInput = screen.getByPlaceholderText(/Введите второе число/i);
  const button = screen.getByText(/Нажми/i);
  
  expect(firstInput).toBeInTheDocument();
  expect(secondInput).toBeInTheDocument();
  expect(button).toBeInTheDocument();
});

test('generates random number', () => {
  render(<App />);
  
  const firstInput = screen.getByPlaceholderText(/Введите первое число/i);
  const secondInput = screen.getByPlaceholderText(/Введите второе число/i);
  const button = screen.getByText(/Нажми/i);

  fireEvent.change(firstInput, { target: { value: '10' } });
  fireEvent.change(secondInput, { target: { value: '5' } });

  fireEvent.click(button);

  const randomLabel = screen.getByClassName('rnd_number');
  expect(randomLabel).toBeInTheDocument();
  expect(parseInt(randomLabel.textContent)).toBeGreaterThanOrEqual(5);
  expect(parseInt(randomLabel.textContent)).toBeLessThanOrEqual(10);
});

test('alerts when invalid input is entered', () => {
  render(<App />);
  
  const firstInput = screen.getByPlaceholderText(/Введите первое число/i);
  const secondInput = screen.getByPlaceholderText(/Введите второе число/i);
  const button = screen.getByText(/Нажми/i);

  fireEvent.change(firstInput, { target: { value: '5' } });
  fireEvent.change(secondInput, { target: { value: '10' } });

  fireEvent.click(button);

  expect(window.alert).toHaveBeenCalledWith("Введите правильные числа и первое число должно быть больше второго, а также оба числа не должны быть равны");
});
