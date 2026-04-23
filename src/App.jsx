import { lazy, Suspense, useState, useEffect } from 'react';
import BottomNav from './components/layout/BottomNav';
import Header from './components/layout/Header';
import ErrorBoundary from './components/ui/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';
import InstallPWA from './components/features/InstallPWA';
import { SimpleAuthProvider, useSimpleAuth } from './context/SimpleAuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { ProductProvider } from './context/ProductContext';
import { initMetrica } from './lib/yandex-metrica';
import { useYandexMetrica } from './lib/useYandexMetrica';

// Lazy Load Pages
const Showcase = lazy(() => import('./pages/Showcase'));
const Gallery = lazy(() => import('./pages/Gallery'));
const AIChat = lazy(() => import('./pages/AIChat'));
const Cart = lazy(() => import('./pages/Cart'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Wishlist = lazy(() => import('./pages/Wishlist'));

const LegalInfo = lazy(() => import('./pages/LegalInfo'));

// Lazy Load Modals
const BuyModal = lazy(() => import('./components/features/BuyModal'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const DebugPWA = lazy(() => import('./pages/DebugPWA'));

import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';

const AppContent = () => {
  const { loading } = useSimpleAuth();
  const { cartItems, addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const location = useLocation();

  // 🎯 YANDEX METRICA: Initialize once on mount
  useEffect(() => {
    initMetrica();
  }, []);

  // 🎯 YANDEX METRICA: Track SPA navigation
  useYandexMetrica();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen font-sans pb-safe selection:bg-amber-500/30">
      {!location.pathname.startsWith('/product/') && <Header />}
      <main className="max-w-md mx-auto bg-white dark:bg-stone-900 min-h-screen shadow-2xl relative overflow-hidden">
        <Suspense fallback={<LoadingSpinner />}>
          <AnimatePresence mode="popLayout">
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
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/legal" element={<LegalInfo />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              {import.meta.env.DEV && (
                <Route
                  path="/debug"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <DebugPWA />
                    </Suspense>
                  }
                />
              )}
              {/* 404 Fallback Route */}
              <Route path="*" element={<NotFound />} />
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
      </Suspense>

      <InstallPWA />
      <BottomNav cartCount={cartItems.length} />
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <ToastProvider>
        <SimpleAuthProvider>
          <ProductProvider>
            <CartProvider>
              <WishlistProvider>
                <AppContent />
              </WishlistProvider>
            </CartProvider>
          </ProductProvider>
        </SimpleAuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
