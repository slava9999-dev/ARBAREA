import { lazy, Suspense, useState } from 'react';
import BottomNav from './components/layout/BottomNav';
import Header from './components/layout/Header';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';

// Lazy Load Pages
const Showcase = lazy(() => import('./pages/Showcase'));
const Gallery = lazy(() => import('./pages/Gallery'));
const AIChat = lazy(() => import('./pages/AIChat'));
const Cart = lazy(() => import('./pages/Cart'));
const Profile = lazy(() => import('./pages/Profile'));

const LegalInfo = lazy(() => import('./pages/LegalInfo'));

// Lazy Load Modals
const BuyModal = lazy(() => import('./components/features/BuyModal'));
const CheckoutModal = lazy(() => import('./components/features/CheckoutModal'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));

import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';

const AppContent = () => {
  const { loading } = useAuth();
  const { cartItems, addToCart, removeFromCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const location = useLocation();

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      setIsCheckoutOpen(true);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen font-sans pb-safe selection:bg-stone-200 dark:selection:bg-stone-700">

      {!location.pathname.startsWith('/product/') && <Header />}
      <main className="max-w-md mx-auto bg-white dark:bg-stone-900 min-h-screen shadow-2xl relative overflow-hidden">
        <Suspense fallback={<LoadingSpinner />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <Showcase
                    onBuy={(product) => {
                      addToCart({ ...product, quantity: 1 });
                    }}
                    onOpenModal={setSelectedProduct}
                  />
                }
              />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/ai" element={<AIChat />} />
              <Route
                path="/cart"
                element={
                  <Cart
                    cart={cartItems}
                    onRemove={(item) => removeFromCart(item.id)}
                    onCheckout={handleCheckout}
                  />
                }
              />
              <Route path="/profile" element={<Profile />} />
              <Route path="/legal" element={<LegalInfo />} />
              <Route path="/product/:id" element={<ProductDetails />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      <Suspense fallback={null}>
        {selectedProduct && (
          <BuyModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
          />
        )}
        {isCheckoutOpen && (
          <CheckoutModal onClose={() => setIsCheckoutOpen(false)} />
        )}
      </Suspense>

      <BottomNav cartCount={cartItems.length} />
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>
);

export default App;
