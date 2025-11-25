import React, { useState, Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy Load Pages
const Showcase = lazy(() => import('./pages/Showcase'));
const Gallery = lazy(() => import('./pages/Gallery'));
const AIChat = lazy(() => import('./pages/AIChat'));
const Cart = lazy(() => import('./pages/Cart'));
const Profile = lazy(() => import('./pages/Profile'));
const Diagnostics = lazy(() => import('./pages/Diagnostics'));

// Lazy Load Modals (Optional, but good for performance)
const BuyModal = lazy(() => import('./components/features/BuyModal'));
const CheckoutModal = lazy(() => import('./components/features/CheckoutModal'));

const AppContent = () => {
    const { loading } = useAuth();
    const { cartItems, addToCart, removeFromCart, clearCart } = useCart();
    const [activeTab, setActiveTab] = useState('home');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const handleCheckout = () => {
        if (cartItems.length > 0) {
            setIsCheckoutOpen(true);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <Showcase onBuy={setSelectedProduct} />;
            case 'gallery':
                return <Gallery />;
            case 'ai':
                return <AIChat />;
            case 'cart':
                return (
                    <Cart
                        cart={cartItems}
                        onRemove={(item) => removeFromCart(item.id)}
                        onCheckout={handleCheckout}
                    />
                );
            case 'profile':
                return <Profile />;
            case 'diagnostics':
                return <Diagnostics />;
            default:
                return <Showcase onBuy={setSelectedProduct} />;
        }
    };

    return (
        <div className="bg-stone-50 dark:bg-stone-950 min-h-screen font-sans pb-safe selection:bg-stone-200 dark:selection:bg-stone-700">
            <div className="noise-overlay" />
            <Header />
            <main className="max-w-md mx-auto bg-white dark:bg-stone-900 min-h-screen shadow-2xl relative overflow-hidden">
                <Suspense fallback={<LoadingSpinner />}>
                    {renderContent()}
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
                    <CheckoutModal
                        onClose={() => setIsCheckoutOpen(false)}
                    />
                )}
            </Suspense>

            <BottomNav
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                cartCount={cartItems.length}
            />
        </div>
    );
};

const App = () => (
    <ThemeProvider>
        <AuthProvider>
            <CartProvider>
                <AppContent />
            </CartProvider>
        </AuthProvider>
    </ThemeProvider>
);

export default App;
