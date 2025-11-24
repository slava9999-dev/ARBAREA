import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import Showcase from './pages/Showcase';
import Gallery from './pages/Gallery';
import AIChat from './pages/AIChat';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import BuyModal from './components/features/BuyModal';
import CheckoutModal from './components/features/CheckoutModal';

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
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin" />
            </div>
        );
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
            default:
                return <Showcase onBuy={setSelectedProduct} />;
        }
    };

    return (
        <div className="bg-stone-50 dark:bg-stone-950 min-h-screen font-sans pb-safe selection:bg-stone-200 dark:selection:bg-stone-700">
            <Header />
            <main className="max-w-md mx-auto bg-white dark:bg-stone-900 min-h-screen shadow-2xl relative overflow-hidden">
                {renderContent()}
            </main>

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
