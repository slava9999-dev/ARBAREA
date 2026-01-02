/**
 * Unit Tests for Cart Reducer
 * Tests all cart operations: add, remove, update, clear
 * @jest-environment jsdom
 */

// Extract the reducer logic for testing
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

describe('cartReducer', () => {
  describe('SET_CART', () => {
    test('sets cart items from payload', () => {
      const items = [
        { id: '1', name: 'Product 1', price: 1000, quantity: 1 },
        { id: '2', name: 'Product 2', price: 2000, quantity: 2 },
      ];

      const result = cartReducer(initialState, {
        type: 'SET_CART',
        payload: items,
      });

      expect(result.items).toEqual(items);
      expect(result.items).toHaveLength(2);
    });

    test('replaces existing items', () => {
      const oldState = {
        items: [{ id: '1', name: 'Old', price: 100, quantity: 1 }],
      };
      const newItems = [{ id: '2', name: 'New', price: 200, quantity: 1 }];

      const result = cartReducer(oldState, {
        type: 'SET_CART',
        payload: newItems,
      });

      expect(result.items).toEqual(newItems);
      expect(result.items).not.toContainEqual(oldState.items[0]);
    });
  });

  describe('ADD_ITEM', () => {
    test('adds new item with quantity 1', () => {
      const product = { id: '1', name: 'Test Product', price: 1500 };

      const result = cartReducer(initialState, {
        type: 'ADD_ITEM',
        payload: product,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual({ ...product, quantity: 1 });
    });

    test('increments quantity for existing item', () => {
      const existingState = {
        items: [{ id: '1', name: 'Product', price: 1000, quantity: 2 }],
      };
      const product = { id: '1', name: 'Product', price: 1000 };

      const result = cartReducer(existingState, {
        type: 'ADD_ITEM',
        payload: product,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(3);
    });

    test('handles item without quantity property', () => {
      const existingState = {
        items: [{ id: '1', name: 'Product', price: 1000 }], // no quantity
      };
      const product = { id: '1', name: 'Product', price: 1000 };

      const result = cartReducer(existingState, {
        type: 'ADD_ITEM',
        payload: product,
      });

      // Should treat undefined quantity as 1, so 1 + 1 = 2
      expect(result.items[0].quantity).toBe(2);
    });

    test('adds multiple different items', () => {
      let state = initialState;

      state = cartReducer(state, {
        type: 'ADD_ITEM',
        payload: { id: '1', name: 'Product 1', price: 1000 },
      });

      state = cartReducer(state, {
        type: 'ADD_ITEM',
        payload: { id: '2', name: 'Product 2', price: 2000 },
      });

      expect(state.items).toHaveLength(2);
      expect(state.items[0].id).toBe('1');
      expect(state.items[1].id).toBe('2');
    });
  });

  describe('REMOVE_ITEM', () => {
    test('removes item by id', () => {
      const existingState = {
        items: [
          { id: '1', name: 'Product 1', price: 1000, quantity: 1 },
          { id: '2', name: 'Product 2', price: 2000, quantity: 1 },
        ],
      };

      const result = cartReducer(existingState, {
        type: 'REMOVE_ITEM',
        payload: '1',
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('2');
    });

    test('does nothing if item not found', () => {
      const existingState = {
        items: [{ id: '1', name: 'Product', price: 1000, quantity: 1 }],
      };

      const result = cartReducer(existingState, {
        type: 'REMOVE_ITEM',
        payload: 'nonexistent',
      });

      expect(result.items).toEqual(existingState.items);
    });

    test('handles removing from empty cart', () => {
      const result = cartReducer(initialState, {
        type: 'REMOVE_ITEM',
        payload: '1',
      });

      expect(result.items).toHaveLength(0);
    });
  });

  describe('UPDATE_QUANTITY', () => {
    test('updates quantity for existing item', () => {
      const existingState = {
        items: [{ id: '1', name: 'Product', price: 1000, quantity: 1 }],
      };

      const result = cartReducer(existingState, {
        type: 'UPDATE_QUANTITY',
        payload: { id: '1', quantity: 5 },
      });

      expect(result.items[0].quantity).toBe(5);
    });

    test('does not update if quantity < 1', () => {
      const existingState = {
        items: [{ id: '1', name: 'Product', price: 1000, quantity: 2 }],
      };

      const result = cartReducer(existingState, {
        type: 'UPDATE_QUANTITY',
        payload: { id: '1', quantity: 0 },
      });

      expect(result.items[0].quantity).toBe(2);
      expect(result).toBe(existingState); // Same reference, no change
    });

    test('does not update if quantity is negative', () => {
      const existingState = {
        items: [{ id: '1', name: 'Product', price: 1000, quantity: 2 }],
      };

      const result = cartReducer(existingState, {
        type: 'UPDATE_QUANTITY',
        payload: { id: '1', quantity: -1 },
      });

      expect(result.items[0].quantity).toBe(2);
    });

    test('does not affect other items', () => {
      const existingState = {
        items: [
          { id: '1', name: 'Product 1', price: 1000, quantity: 1 },
          { id: '2', name: 'Product 2', price: 2000, quantity: 3 },
        ],
      };

      const result = cartReducer(existingState, {
        type: 'UPDATE_QUANTITY',
        payload: { id: '1', quantity: 10 },
      });

      expect(result.items[0].quantity).toBe(10);
      expect(result.items[1].quantity).toBe(3);
    });
  });

  describe('CLEAR_CART', () => {
    test('removes all items', () => {
      const existingState = {
        items: [
          { id: '1', name: 'Product 1', price: 1000, quantity: 1 },
          { id: '2', name: 'Product 2', price: 2000, quantity: 2 },
        ],
      };

      const result = cartReducer(existingState, { type: 'CLEAR_CART' });

      expect(result.items).toHaveLength(0);
      expect(result.items).toEqual([]);
    });

    test('handles already empty cart', () => {
      const result = cartReducer(initialState, { type: 'CLEAR_CART' });

      expect(result.items).toHaveLength(0);
    });
  });

  describe('unknown action', () => {
    test('returns current state for unknown action', () => {
      const existingState = {
        items: [{ id: '1', name: 'Product', price: 1000, quantity: 1 }],
      };

      const result = cartReducer(existingState, { type: 'UNKNOWN_ACTION' });

      expect(result).toEqual(existingState);
    });
  });
});

// Helper functions tests
describe('Cart Calculations', () => {
  const calculateTotalItems = (items) =>
    items.reduce((total, item) => total + (item.quantity || 1), 0);

  const calculateSubtotal = (items) =>
    items.reduce((total, item) => total + item.price * (item.quantity || 1), 0);

  test('calculates total items correctly', () => {
    const items = [
      { id: '1', price: 1000, quantity: 2 },
      { id: '2', price: 2000, quantity: 3 },
    ];

    expect(calculateTotalItems(items)).toBe(5);
  });

  test('calculates subtotal correctly', () => {
    const items = [
      { id: '1', price: 1000, quantity: 2 }, // 2000
      { id: '2', price: 500, quantity: 3 }, // 1500
    ];

    expect(calculateSubtotal(items)).toBe(3500);
  });

  test('handles empty cart', () => {
    expect(calculateTotalItems([])).toBe(0);
    expect(calculateSubtotal([])).toBe(0);
  });

  test('defaults quantity to 1 if undefined', () => {
    const items = [{ id: '1', price: 1000 }];

    expect(calculateTotalItems(items)).toBe(1);
    expect(calculateSubtotal(items)).toBe(1000);
  });
});
