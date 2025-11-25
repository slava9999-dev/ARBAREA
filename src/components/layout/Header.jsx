import { useContext } from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../../context/ThemeContext';

const Header = () => {
  const { dark, setDark } = useContext(ThemeContext);

  return (
    <div className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md z-40 px-6 py-4 flex justify-between items-center border-b border-stone-100 dark:border-stone-800 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <motion.div 
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "backOut" }}
          className="w-10 h-10 bg-stone-900 dark:bg-stone-100 rounded-xl flex items-center justify-center shadow-lg"
        >
          <span className="text-white dark:text-stone-900 font-serif font-bold text-xl">A</span>
        </motion.div>
        <div className="flex flex-col">
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 tracking-[0.25em] leading-none"
          >
            RBAREA
          </motion.h1>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-[8px] uppercase tracking-[0.4em] text-stone-400 dark:text-stone-500 ml-0.5"
          >
            Workshop
          </motion.span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setDark(!dark)}
          className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? (
            <Sun size={24} className="text-stone-200" />
          ) : (
            <Moon size={24} className="text-stone-600" />
          )}
        </button>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <Menu size={24} className="text-stone-600 dark:text-stone-200" />
        </button>
      </div>
    </div>
  );
};

export default Header;
