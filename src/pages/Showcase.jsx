import React, { useState } from 'react';
import { ChevronRight, Zap } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/mockData';
import FlipProductCard from '../components/features/FlipProductCard';
import SocialFooter from '../components/layout/SocialFooter';

const Showcase = ({ onBuy }) => {
    const [activeCategory, setActiveCategory] = useState('Все');
    const filtered = activeCategory === 'Все' ? PRODUCTS : PRODUCTS.filter(p => p.category === activeCategory);
    return (
        <div className="pb-24 pt-20 px-4">
            <div className="mb-6"><h2 className="text-2xl font-serif text-stone-800 mb-2">Коллекция</h2></div>
            <div className="mb-8 bg-stone-800 text-white p-4 rounded-2xl flex justify-between items-center shadow-lg"><div className="flex gap-2 items-center font-bold"><Zap className="text-yellow-400" /> Покупка в 1 клик</div><ChevronRight /></div>
            <div className="flex gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide">{CATEGORIES.map(c => <button key={c} onClick={() => setActiveCategory(c)} className={`px-5 py-2.5 rounded-full text-sm whitespace-nowrap ${activeCategory === c ? 'bg-stone-800 text-white' : 'bg-white border'}`}>{c}</button>)}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{filtered.map(p => <FlipProductCard key={p.id} product={p} onBuy={onBuy} />)}</div>
            <SocialFooter />
        </div>
    );
};

export default Showcase;
