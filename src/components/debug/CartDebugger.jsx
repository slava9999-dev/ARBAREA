import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';

const CartDebugger = () => {
    const { cartItems, addToCart, clearCart } = useCart();
    const [isMinimized, setIsMinimized] = useState(false);

    const handleAddTestItem = () => {
        const testProduct = {
            id: 999,
            name: 'TEST ТОВАР ДЛЯ ОТЛАДКИ',
            price: 999,
            category: 'Test',
            image: 'https://via.placeholder.com/150',
            rating: 5.0,
            description: 'Тестовый товар для проверки работы корзины'
        };

        console.log('[CART_DEBUGGER] Принудительное добавление тестового товара:', testProduct);
        addToCart(testProduct);
    };

    const handleClearCart = () => {
        if (window.confirm('Очистить всю корзину? (Это действие нельзя отменить)')) {
            clearCart();
            console.log('[CART_DEBUGGER] Корзина очищена');
        }
    };

    return (
        <div
            className="fixed bottom-4 right-4 z-[9999] bg-black/90 border-2 border-red-500 text-red-400 font-mono text-xs rounded-lg shadow-2xl"
            style={{ maxWidth: '400px', maxHeight: '600px' }}
        >
            {/* Header */}
            <div className="bg-red-900 text-white px-3 py-2 flex justify-between items-center border-b-2 border-red-500">
                <span className="font-bold">🔧 CART DEBUGGER (УДАЛИТЬ ПОСЛЕ ОТЛАДКИ!)</span>
                <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-white hover:text-red-300 transition-colors"
                >
                    {isMinimized ? '▲' : '▼'}
                </button>
            </div>

            {!isMinimized && (
                <div className="p-3 space-y-3 overflow-y-auto" style={{ maxHeight: '500px' }}>
                    {/* Cart Count */}
                    <div className="border border-red-500 p-2 rounded">
                        <div className="text-yellow-300 font-bold mb-1">📊 СОСТОЯНИЕ КОРЗИНЫ:</div>
                        <div>Товаров в корзине: <span className="text-white font-bold">{cartItems.length}</span></div>
                        <div className="text-[10px] text-gray-400 mt-1">
                            (Если число не меняется при добавлении - проблема в State/Context)
                        </div>
                    </div>

                    {/* Cart Items JSON */}
                    <div className="border border-red-500 p-2 rounded">
                        <div className="text-yellow-300 font-bold mb-1">📦 СОДЕРЖИМОЕ (JSON):</div>
                        <pre className="text-[10px] text-green-400 overflow-x-auto whitespace-pre-wrap break-all bg-black/50 p-2 rounded">
                            {JSON.stringify(cartItems, null, 2)}
                        </pre>
                        {cartItems.length === 0 && (
                            <div className="text-orange-400 mt-2 text-[10px]">
                                ⚠️ Корзина пуста. Попробуйте добавить товар.
                            </div>
                        )}
                    </div>

                    {/* LocalStorage Check */}
                    <div className="border border-red-500 p-2 rounded">
                        <div className="text-yellow-300 font-bold mb-1">💾 LOCALSTORAGE:</div>
                        <pre className="text-[10px] text-blue-400 overflow-x-auto whitespace-pre-wrap break-all bg-black/50 p-2 rounded">
                            {localStorage.getItem('guest_cart') || 'null (пусто)'}
                        </pre>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                        <button
                            onClick={handleAddTestItem}
                            className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            ➕ Add Test Item
                        </button>
                        <button
                            onClick={handleClearCart}
                            className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            🗑️ Clear Cart
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="border border-yellow-500 bg-yellow-900/20 p-2 rounded text-[10px] text-yellow-200">
                        <div className="font-bold mb-1">💡 КАК ПОЛЬЗОВАТЬСЯ:</div>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Нажми "Add Test Item" - если число товаров увеличилось, Context работает!</li>
                            <li>Открой Console (F12) и ищи логи <code className="bg-black px-1">[CART_DEBUG]</code></li>
                            <li>Нажми "Купить" на реальном товаре - смотри логи в консоли</li>
                            <li>Если логов нет - кнопка не работает (проблема в UI)</li>
                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartDebugger;
