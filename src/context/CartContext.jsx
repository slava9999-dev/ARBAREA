import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const initialState = {
  items: [],
};

const cartReducer = (state, action) => {
  console.log('🛒 [Cart Action]:', action.type, action.payload);

  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload,
      };

    case 'ADD_ITEM': {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === newItem.id
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
          item.id === id ? { ...item, quantity } : item
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

  // Derived state calculations
  const totalItems = state.items.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  // Calculate Subtotal, Discount, and Total
  const { user } = useAuth();
  const subtotal = state.items.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );
  
  // 10% discount for authorized users
  const discount = user ? Math.round(subtotal * 0.1) : 0;
  const cartTotal = subtotal - discount;

  const addToCart = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const value = {
    cartItems: state.items,
    totalItems,
    subtotal,      // Raw total
    discount,      // Calculated discount
    cartTotal,     // Final total to pay
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
