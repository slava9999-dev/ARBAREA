/**
 * Tests for ProductContext
 * Validates product loading and state management
 * @jest-environment jsdom
 */
/* eslint-env jest */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ProductProvider, useProducts } from '../context/ProductContext';
import { supabase } from '../lib/supabase';
import '@testing-library/jest-dom';

// Mock Supabase module
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const TestComponent = () => {
  const { products, loading, error } = useProducts();

  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">{error}</div>;
  return (
    <div data-testid="products">
      {products.map((p) => (
        <div key={p.id} data-testid="product-item">
          {p.name}
        </div>
      ))}
    </div>
  );
};

describe('ProductContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('provides loading state initially', async () => {
    // Setup a promise that never resolves to simulate loading
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue(new Promise(() => {})),
      }),
    });

    render(
      <ProductProvider>
        <TestComponent />
      </ProductProvider>,
    );
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('falls back to static products when DB is empty', async () => {
    // Return empty array from DB
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });

    render(
      <ProductProvider>
        <TestComponent />
      </ProductProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Should fallback to static
    const items = screen.getAllByTestId('product-item');
    expect(items.length).toBeGreaterThan(0);
  });

  test('maps database products correctly to UI structure', async () => {
    const mockDbProducts = [
      {
        id: '123',
        name: 'Test Oak Table',
        price: 5000,
        images: ['/test.webp'],
        colors: [{ id: 'oak', name: 'Дуб' }],
        sizes: [{ label: 'XL', priceMod: 0 }],
        category: 'Декор',
        created_at: '2023-01-01',
      },
    ];

    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest
          .fn()
          .mockResolvedValue({ data: mockDbProducts, error: null }),
      }),
    });

    render(
      <ProductProvider>
        <TestComponent />
      </ProductProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Test Oak Table')).toBeInTheDocument();
    });
  });

  test('handles error state correctly', async () => {
    // Simulate error
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest
          .fn()
          .mockResolvedValue({
            data: null,
            error: { message: 'Connection failed' },
          }),
      }),
    });

    // Suppress console.error for this test
    const constoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ProductProvider>
        <TestComponent />
      </ProductProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // TestComponent renders error div if error is present
    expect(screen.getByTestId('error')).toHaveTextContent('Connection failed');

    constoleSpy.mockRestore();
  });
});
