import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { supabase } from '../lib/supabase';
import { PRODUCTS as STATIC_PRODUCTS } from '../data/products';

const ProductContext = createContext({
  products: [],
  loading: true,
  error: null,
  refreshProducts: () => {},
});

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(STATIC_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: sbError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (sbError) throw sbError;

      if (data && data.length > 0) {
        // Map DB structure to UI structure
        const mappedProducts = data.map((p) => ({
          ...p,
          id: p.id, // Keeping original UUID
          image: p.images?.[0] || '/images/placeholder.webp',
          gallery: p.images || [],
          variants: {
            colors: p.colors || [],
            sizes: p.sizes || [],
          },
          hasOptions: p.colors?.length > 0 || p.sizes?.length > 0,
        }));
        setProducts(mappedProducts);
      } else {
        console.log('📡 No products in DB, using static fallback.');
        setProducts(STATIC_PRODUCTS);
      }
    } catch (err) {
      console.error('❌ Error fetching products from Supabase:', err);
      setError(err.message);
      // Fallback to static products on error
      setProducts(STATIC_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts: fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
