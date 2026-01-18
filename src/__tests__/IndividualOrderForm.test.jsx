import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import IndividualOrderForm from '../components/features/profile/IndividualOrderForm';
import { useSimpleAuth } from '../context/SimpleAuthContext';
import { supabase } from '../lib/supabase';

// Mock the context
jest.mock('../context/SimpleAuthContext', () => ({
  useSimpleAuth: jest.fn(),
}));

// Mock Supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
    auth: {
      getSession: jest.fn(),
    },
  },
}));

// Mock Telegram notification
jest.mock('../lib/telegram', () => ({
  sendTelegramNotification: jest.fn(() => Promise.resolve({ ok: true })),
}));

// Mock lucide-react to avoid issues with icon imports in Jest
jest.mock('lucide-react', () => ({
  ArrowRight: () => <div data-testid="ArrowRight" />,
  Check: () => <div data-testid="Check" />,
  FileText: () => <div data-testid="FileText" />,
  Upload: () => <div data-testid="Upload" />,
  X: () => <div data-testid="X" />,
}));

describe('IndividualOrderForm', () => {
  const mockUser = {
    id: 'user123',
    name: 'Test User',
    phone: '+79991234567',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useSimpleAuth.mockReturnValue({ user: mockUser });

    // Setup Supabase mocks
    const mockInsert = jest.fn().mockResolvedValue({ error: null });
    const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });
    supabase.from.mockImplementation(mockFrom);

    const mockUpload = jest.fn().mockResolvedValue({ error: null });
    const mockGetPublicUrl = jest
      .fn()
      .mockReturnValue({ data: { publicUrl: 'https://example.com/file.jpg' } });
    const mockStorageFrom = jest.fn().mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    });
    supabase.storage.from.mockImplementation(mockStorageFrom);

    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'fake-token' } },
    });

    // Mock alert since it's used in the component
    window.alert = jest.fn();
  });

  test('renders form correctly', () => {
    render(<IndividualOrderForm />);
    expect(screen.getByText('Индивидуальный заказ')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Например: Обеденный стол из дуба'),
    ).toBeInTheDocument();
  });

  test('requires login to submit', () => {
    useSimpleAuth.mockReturnValue({ user: null });
    render(<IndividualOrderForm />);

    // Fill required fields to pass HTML5 validation
    fireEvent.change(screen.getByLabelText(/Ваше имя/i), {
      target: { value: 'Guest' },
    });
    fireEvent.change(screen.getByLabelText(/Телефон/i), {
      target: { value: '+79990000000' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Например/i), {
      target: { value: 'Table' },
    });

    const submitBtn = screen.getByText('Отправить заявку');
    fireEvent.click(submitBtn);

    expect(window.alert).toHaveBeenCalledWith(
      'Войдите в аккаунт для отправки заявки',
    );
    expect(supabase.from).not.toHaveBeenCalled();
  });

  test('fills and submits form correctly without file', async () => {
    render(<IndividualOrderForm />);

    fireEvent.change(screen.getByLabelText(/Что будем создавать/i), {
      target: { value: 'Custom Table' },
    });
    // Use LabelText because placeholder is generic '0'
    fireEvent.change(screen.getByLabelText(/Длина/i), {
      target: { value: '200' },
    });
    fireEvent.change(screen.getByLabelText(/Ширина/i), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText(/Детали/i), {
      target: { value: 'Dark wood' },
    });

    const submitBtn = screen.getByText('Отправить заявку');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('individual_orders');
    });

    expect(window.alert).toHaveBeenCalledWith(
      'Заявка успешно отправлена! Мы свяжемся с вами.',
    );

    // Check payload
    const insertCall = supabase.from('individual_orders').insert.mock.calls[0];
    const payload = insertCall[0][0]; // first arg, first element of array
    expect(payload).toMatchObject({
      user_id: 'user123',
      description: 'Custom Table',
      dimensions: { length: '200', width: '100' },
      details: 'Dark wood',
      status: 'pending',
    });
  });

  test('handles file upload and submission', async () => {
    const { container } = render(<IndividualOrderForm />);

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/Что будем создавать/i), {
      target: { value: 'Table with File' },
    });
    fireEvent.change(screen.getByLabelText(/Телефон/i), {
      target: { value: '+79990000000' },
    });
    fireEvent.change(screen.getByLabelText(/Ваше имя/i), {
      target: { value: 'Test' },
    });

    // Find hidden file input
    const input = container.querySelector('input[type="file"]');
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    // Check if filename appears using a more flexible matcher if text is split
    await waitFor(() => {
      expect(screen.getByText(/test.png/i)).toBeInTheDocument();
    });

    const submitBtn = screen.getByText('Отправить заявку');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supabase.storage.from).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('individual_orders');
    });
  });
});
