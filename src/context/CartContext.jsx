import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useMemo,
} from 'react';
import { useProducts } from './ProductContext';
import { ecommerceAdd, ecommerceRemove } from '../lib/yandex-metrica';

const CartContext = createContext();

const initialState = {
  items: [],
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload,
      };

    case 'ADD_ITEM': {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === newItem.id,
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: (updatedItems[existingItemIndex].quantity || 1) + 1,
        };
        return { ...state, items: updatedItems };
      }

      return {
        ...state,
        items: [...state.items, { ...newItem, quantity: 1 }],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity < 1) return state;

      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item,
        ),
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { products, loading: productsLoading } = useProducts();
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    try {
      const localData = localStorage.getItem('arbarea_cart');
      return localData ? { items: JSON.parse(localData) } : initialState;
    } catch (error) {
      console.error('Error reading cart from localStorage:', error);
      return initialState;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('arbarea_cart', JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  // Derive enriched cart items with latest prices
  const cartItems = useMemo(() => {
    if (productsLoading || !products.length) return state.items;

    return state.items.map((item) => {
      const baseProduct = products.find(
        (p) => p.id === (item.productId || String(item.id).split('::')[0]),
      );
      if (!baseProduct) return item;

      // Recalculate price if base product found
      const basePrice = baseProduct.price;
      const sizeMod = item.selectedSize?.priceMod || 0;
      const currentPrice = basePrice + sizeMod;

      return {
        ...item,
        price: currentPrice,
        name:
          baseProduct.name +
          (item.selectedSize ? ` (${item.selectedSize.label})` : ''),
        image: baseProduct.image,
      };
    });
  }, [state.items, products, productsLoading]);

  // Derived state calculations
  const totalItems = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0,
  );

  const addToCart = (product) => {
    if (!product || !product.id) return;
    dispatch({ type: 'ADD_ITEM', payload: product });
    ecommerceAdd(product);
  };

  const removeFromCart = (productId) => {
    const itemToRemove = state.items.find((item) => item.id === productId);
    if (itemToRemove) {
      ecommerceRemove(itemToRemove);
    }
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Discount (could be added here)
  const discount = 0;
  const cartTotal = subtotal - discount;

  const value = {
    cartItems,
    totalItems,
    subtotal,
    cartTotal,
    discount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
