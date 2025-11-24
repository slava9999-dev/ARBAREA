import React, { useContext } from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';

const Header = () => {
    const { dark, setDark } = useContext(ThemeContext);

    return (
        <div className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md z-40 px-6 py-4 flex justify-between items-center border-b border-stone-100 dark:border-stone-800">
            <h1 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100 tracking-wider">
                ARBAREA
            </h1>
            <div className="flex items-center gap-2">
                <button
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
                <button className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                    <Menu size={24} className="text-stone-600 dark:text-stone-200" />
                </button>
            </div>
        </div>
    );
};

export default Header;
