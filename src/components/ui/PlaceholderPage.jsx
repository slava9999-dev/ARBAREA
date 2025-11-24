import React from 'react';

const PlaceholderPage = ({ title }) => (
    <div className="container mx-auto px-6 py-20 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-stone-900 mb-4">{title}</h1>
            <p className="text-stone-600">Страница находится в разработке.</p>
        </div>
    </div>
);

export default PlaceholderPage;
