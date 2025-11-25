import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const DebugPage = () => {
    const { user, loading: authLoading } = useAuth();
    const { cartItems, addToCart } = useCart();
    const [logs, setLogs] = useState([]);
    const [envStatus, setEnvStatus] = useState({});
    const [apiStatus, setApiStatus] = useState({ loading: false, result: null });

    const addLog = (msg, type = 'info') => {
        setLogs(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
    };

    useEffect(() => {
        // 1. Check Env Vars
        const envs = {
            'VITE_FIREBASE_API_KEY': import.meta.env.VITE_FIREBASE_API_KEY,
            'VITE_FIREBASE_PROJECT_ID': import.meta.env.VITE_FIREBASE_PROJECT_ID,
            'VITE_GEMINI_API_KEY': import.meta.env.VITE_GEMINI_API_KEY,
        };

        const status = {};
        Object.keys(envs).forEach(key => {
            if (key === 'VITE_GEMINI_API_KEY' && !envs[key]) {
                status[key] = 'ℹ️ Backend Only (OK)';
            } else {
                status[key] = envs[key] ? '✅ Loaded' : '❌ Missing';
            }
        });
        setEnvStatus(status);
        addLog('Environment variables checked');

        // 2. Check LocalStorage
        try {
            localStorage.setItem('test_write', 'ok');
            localStorage.removeItem('test_write');
            addLog('✅ LocalStorage is working', 'success');
        } catch (e) {
            addLog('❌ LocalStorage failed: ' + e.message, 'error');
        }

    }, []);

    const testAI = async () => {
        setApiStatus({ loading: true, result: null });
        addLog('Testing AI API...', 'info');
        try {
            const response = await fetch('/api/gemini-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: [],
                    message: 'Ping'
                })
            });
            const data = await response.json();
            if (response.ok) {
                setApiStatus({ loading: false, result: '✅ Success: ' + (data.text || 'No text') });
                addLog('✅ AI API Success', 'success');
            } else {
                let errorMsg = JSON.stringify(data);
                if (data.error?.code === 404) {
                    errorMsg = "⚠️ API Not Enabled? Go to Google Cloud Console -> Enable 'Generative Language API'.";
                }
                setApiStatus({ loading: false, result: '❌ Error: ' + errorMsg });
                addLog('❌ AI API Error: ' + errorMsg, 'error');
            }
        } catch (e) {
            setApiStatus({ loading: false, result: '❌ Network Error: ' + e.message });
            addLog('❌ AI Network Error: ' + e.message, 'error');
        }
    };

    const testCart = () => {
        addLog('Testing Add to Cart...', 'info');
        try {
            addToCart({
                id: 'debug-product-1',
                name: 'Debug Product',
                price: 100,
                quantity: 1
            });
            addLog('✅ addToCart function called without error', 'success');
        } catch (e) {
            addLog('❌ addToCart crashed: ' + e.message, 'error');
        }
    };

    return (
        <div className="pt-24 px-4 pb-24 min-h-screen bg-stone-50 text-stone-800 font-mono text-xs">
            <h1 className="text-xl font-bold mb-4">🛠 System Diagnostics</h1>

            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-stone-200">
                <h2 className="font-bold mb-2 text-stone-500 uppercase">Environment</h2>
                {Object.entries(envStatus).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-stone-100 last:border-0">
                        <span>{k}</span>
                        <span className={v.includes('Missing') ? 'text-red-500 font-bold' : 'text-green-600'}>{v}</span>
                    </div>
                ))}
            </div>

            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-stone-200">
                <h2 className="font-bold mb-2 text-stone-500 uppercase">Auth State</h2>
                <div>User: {authLoading ? 'Loading...' : (user ? `✅ Logged in (${user.email || 'Anon'})` : '❌ Guest')}</div>
                <div>UID: {user?.uid || 'N/A'}</div>
            </div>

            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-stone-200">
                <h2 className="font-bold mb-2 text-stone-500 uppercase">Cart State</h2>
                <div>Items in Cart: {cartItems.length}</div>
                <button onClick={testCart} className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    Test Add Item
                </button>
            </div>

            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-stone-200">
                <h2 className="font-bold mb-2 text-stone-500 uppercase">API Test (AI)</h2>
                <button onClick={testAI} disabled={apiStatus.loading} className="px-3 py-1 bg-stone-800 text-white rounded hover:bg-stone-700 disabled:opacity-50">
                    {apiStatus.loading ? 'Testing...' : 'Ping AI Server'}
                </button>
                {apiStatus.result && (
                    <div className="mt-2 p-2 bg-stone-100 rounded break-all">
                        {apiStatus.result}
                    </div>
                )}
            </div>

            <div className="p-4 bg-stone-900 text-green-400 rounded-xl shadow-sm overflow-hidden">
                <h2 className="font-bold mb-2 text-stone-500 uppercase">Live Logs</h2>
                <div className="h-40 overflow-y-auto">
                    {logs.map((l, i) => (
                        <div key={i} className={`mb-1 ${l.type === 'error' ? 'text-red-400' : (l.type === 'success' ? 'text-green-400' : 'text-stone-300')}`}>
                            <span className="opacity-50">[{l.time}]</span> {l.msg}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DebugPage;
