/**
 * Core TypeScript Types for arbarea-mobile-app
 * Provides type safety for contexts, API responses, and data models
 */

import type { User, Session, SupabaseClient } from '@supabase/supabase-js';

// =====================================================================
// DATABASE TYPES
// =====================================================================

export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  role: 'user' | 'admin';
  avatar_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  old_price: number | null;
  category: string | null;
  subcategory: string | null;
  images: string[] | null;
  colors: ProductColor[] | null;
  sizes: string[] | null;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface Order {
  id: string;
  order_id: string;
  user_id: string | null;
  user_email: string | null;
  user_phone: string | null;
  user_name: string | null;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  delivery_method: string | null;
  delivery_address: string | null;
  delivery_price: number | null;
  payment_url: string | null;
  payment_id: string | null;
  status: OrderStatus;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
}

export interface IndividualOrder {
  id: string;
  order_id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  user_phone: string | null;
  description: string;
  dimensions: OrderDimensions | null;
  details: string | null;
  file_url: string | null;
  file_name: string | null;
  status: IndividualOrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type IndividualOrderStatus =
  | 'pending'
  | 'quoted'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface OrderDimensions {
  width?: number;
  height?: number;
  depth?: number;
  unit?: 'cm' | 'mm' | 'inch';
}

// =====================================================================
// CART TYPES
// =====================================================================

export interface CartItem extends OrderItem {
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

// =====================================================================
// CONTEXT TYPES
// =====================================================================

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  // Email auth
  loginWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ user: User | null; session: Session | null }>;
  registerWithEmail: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>,
  ) => Promise<{ user: User | null; session: Session | null }>;
  // Magic link
  sendMagicLink: (email: string) => Promise<void>;
  // Phone auth
  sendPhoneOtp: (phone: string) => Promise<void>;
  verifyPhoneOtp: (
    phone: string,
    token: string,
  ) => Promise<{ user: User | null; session: Session | null }>;
  // OAuth
  loginWithGoogle: () => Promise<void>;
  // General
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  // Supabase client
  supabase: SupabaseClient;
}

export interface CartContextValue {
  cartItems: CartItem[];
  totalItems: number;
  subtotal: number;
  addToCart: (product: Product | CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface WishlistContextValue {
  wishlistItems: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// =====================================================================
// API TYPES
// =====================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaymentResponse {
  success: boolean;
  payment_url?: string;
  payment_id?: string;
  error?: string;
}

export interface TelegramNotification {
  chat_id: string;
  message: string;
  parse_mode?: 'HTML' | 'Markdown';
}

// =====================================================================
// COMPONENT PROPS TYPES
// =====================================================================

export interface ProductCardProps {
  product: Product;
  onBuy?: (product: Product) => void;
  onOpenModal?: (product: Product) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

// =====================================================================
// UTILITY TYPES
// =====================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type AsyncFunction<T = void> = () => Promise<T>;
