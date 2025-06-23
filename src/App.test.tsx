import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders PinkPay dashboard', () => {
  render(<App />);
  const titleElement = screen.getByText(/PinkPay Payment Switch/i);
  expect(titleElement).toBeInTheDocument();
}); 
 