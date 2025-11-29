import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';

const DELAY = 800;

export const fetchProducts = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(PRODUCTS);
    }, DELAY);
  });
};

export const fetchCategories = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(CATEGORIES);
    }, DELAY);
  });
};
