import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SatuPay dashboard', () => {
  render(<App />);
  const titleElement = screen.getByText(/SatuPay Payment Switch/i);
  expect(titleElement).toBeInTheDocument();
}); 
 