import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';

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
