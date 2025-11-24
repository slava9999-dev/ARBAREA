import React from 'react';
import { INTERIORS } from '../data/mockData';
import SocialFooter from '../components/layout/SocialFooter';

const Gallery = () => (
    <div className="pb-24 pt-20 px-4">
        <h2 className="text-2xl font-serif mb-6">Интерьеры</h2>
        <div className="space-y-4 columns-1 sm:columns-2 gap-4">{INTERIORS.map((img, i) => <div key={i} className="rounded-2xl overflow-hidden break-inside-avoid mb-4"><img src={img} alt={`Интерьер ${i + 1}`} loading="lazy" className="w-full" /></div>)}</div>
        <SocialFooter />
    </div>
);

export default Gallery;
