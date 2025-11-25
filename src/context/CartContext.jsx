import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, getDocs, writeBatch } from 'firebase/firestore';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const localData = localStorage.getItem('guest_cart');
            return localData ? JSON.parse(localData) : [];
        } catch (e) {
            console.error('Corrupted guest_cart, resetting.', e);
            localStorage.removeItem('guest_cart');
            return [];
        }
    });
    const { user } = useAuth();

    // Sync with Firestore when user logs in
    useEffect(() => {
        if (!user) return;

        const cartRef = collection(db, 'users', user.uid, 'cart');
        const q = query(cartRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCartItems(items);
        }, (error) => {
            console.error("Error fetching cart:", error);
        });

        return unsubscribe;
    }, [user]);

    // Persist to LocalStorage for guests
    useEffect(() => {
        if (!user) {
            localStorage.setItem('guest_cart', JSON.stringify(cartItems));
        }
    }, [cartItems, user]);

    const addToCart = async (product) => {
        console.log('🛒 addToCart called with product:', product);
        const cartItemId = `${product.id}-${product.selectedSize || 'default'}-${product.selectedColor || 'default'}`;
        console.log('🆔 Generated cartItemId:', cartItemId);

        if (!user) {
            console.log('👤 Guest mode - using localStorage');
            // Guest Logic
            setCartItems(prev => {
                const existing = prev.find(item => item.id === cartItemId);
                let newCart;
                if (existing) {
                    console.log('✅ Item exists, incrementing quantity');
                    newCart = prev.map(item => item.id === cartItemId ? { ...item, quantity: (item.quantity || 1) + 1 } : item);
                } else {
                    console.log('➕ New item, adding to cart');
                    newCart = [...prev, { ...product, id: cartItemId, quantity: 1 }];
                }
                localStorage.setItem('guest_cart', JSON.stringify(newCart));
                console.log('💾 Cart saved to localStorage:', newCart);
                return newCart;
            });
            return;
        }

        // Auth Logic
        console.log('🔐 Authenticated user - using Firestore');
        const itemRef = doc(db, 'users', user.uid, 'cart', cartItemId);
        try {
            const existingItem = cartItems.find(item => item.id === cartItemId);
            const quantity = existingItem ? (existingItem.quantity || 1) + 1 : 1;
            console.log('📊 Quantity to save:', quantity);

            await setDoc(itemRef, {
                ...product,
                id: cartItemId,
                quantity,
                updatedAt: new Date()
            });
            console.log('✅ Item saved to Firestore');

            // Optimistically update local state
            setCartItems(prev => {
                const exists = prev.find(i => i.id === cartItemId);
                if (exists) {
                    return prev.map(i => i.id === cartItemId ? { ...i, quantity: (i.quantity || 1) + 1 } : i);
                }
                return [...prev, { ...product, id: cartItemId, quantity: 1 }];
            });
            console.log('🔄 Local state updated');
        } catch (error) {
            console.error("❌ Error adding to cart:", error);
            alert('Ошибка добавления в корзину: ' + error.message);
        }
    };

    const removeFromCart = async (id) => {
        if (!user) {
            setCartItems(prev => {
                const newCart = prev.filter(item => item.id !== id);
                localStorage.setItem('guest_cart', JSON.stringify(newCart));
                return newCart;
            });
            return;
        }

        try {
            await deleteDoc(doc(db, 'users', user.uid, 'cart', id));
        } catch (error) {
            console.error("Error removing from cart:", error);
        }
    };

    const updateQuantity = async (id, quantity) => {
        if (!user) {
            setCartItems(prev => {
                const newCart = prev.map(item => item.id === id ? { ...item, quantity } : item);
                localStorage.setItem('guest_cart', JSON.stringify(newCart));
                return newCart;
            });
            return;
        }

        try {
            const itemRef = doc(db, 'users', user.uid, 'cart', id);
            await setDoc(itemRef, { quantity }, { merge: true });
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const clearCart = async () => {
        if (!user) {
            setCartItems([]);
            localStorage.removeItem('guest_cart');
            return;
        }

        try {
            const batch = writeBatch(db);
            cartItems.forEach(item => {
                const itemRef = doc(db, 'users', user.uid, 'cart', item.id);
                batch.delete(itemRef);
            });
            await batch.commit();
        } catch (error) {
            console.error("Error clearing cart:", error);
        }
    };

    const subtotal = cartItems.reduce((total, item) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        return total + price * (item.quantity || 1);
    }, 0);

    // 10% discount for registered users
    const discount = user ? Math.round(subtotal * 0.10) : 0;
    const cartTotal = subtotal - discount;

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        subtotal,
        discount
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
