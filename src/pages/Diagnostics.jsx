import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signInAnonymously, fetchSignInMethodsForEmail } from 'firebase/auth';

const Diagnostics = () => {
    const [status, setStatus] = useState('Running checks...');
    const [logs, setLogs] = useState([]);

    const addLog = (message, type = 'info') => {
        setLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
    };

    const runDiagnostics = async () => {
        addLog('Starting Firebase Diagnostics...', 'info');

        // 1. Check Config Presence
        const configKeys = [
            'VITE_FIREBASE_API_KEY',
            'VITE_FIREBASE_AUTH_DOMAIN',
            'VITE_FIREBASE_PROJECT_ID'
        ];

        configKeys.forEach(key => {
            if (import.meta.env[key]) {
                addLog(`✅ Config found: ${key}`, 'success');
            } else {
                addLog(`❌ MISSING Config: ${key}`, 'error');
            }
        });

        // 2. Test Auth Connection (Anonymous Login)
        try {
            addLog('Attempting Anonymous Login...', 'info');
            // Note: Anonymous auth must be enabled in Firebase Console for this to work perfectly,
            // but even if disabled, the error message will tell us if the API key is valid.
            await signInAnonymously(auth);
            addLog('✅ Anonymous Login Successful! Firebase connection is working.', 'success');
        } catch (error) {
            addLog(`⚠️ Auth Check Result: ${error.code} - ${error.message}`, error.code === 'auth/admin-restricted-operation' ? 'warning' : 'error');

            if (error.code === 'auth/api-key-not-valid') {
                addLog('❌ CRITICAL: API Key is invalid. Check .env file.', 'error');
            } else if (error.code === 'auth/operation-not-allowed') {
                addLog('ℹ️ Note: Anonymous auth is disabled in Console, but connection seems OK.', 'warning');
            } else if (error.code === 'auth/network-request-failed') {
                addLog('❌ Network Error. Check your internet connection or CORS/CSP settings.', 'error');
            }
        }

        setStatus('Diagnostics Complete');
    };

    useEffect(() => {
        runDiagnostics();
    }, []);

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-900 p-6 pt-24 font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4 text-stone-800 dark:text-stone-100">System Diagnostics</h1>
            <div className="mb-4 font-bold text-blue-600">{status}</div>

            <div className="bg-white dark:bg-stone-950 rounded-xl shadow-lg border border-stone-200 dark:border-stone-800 overflow-hidden">
                {logs.map((log, index) => (
                    <div key={index} className={`p-3 border-b border-stone-100 dark:border-stone-800 ${log.type === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' :
                            log.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
                                log.type === 'warning' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
                                    'text-stone-600 dark:text-stone-400'
                        }`}>
                        <span className="opacity-50 mr-2">[{log.timestamp}]</span>
                        {log.message}
                    </div>
                ))}
            </div>

            <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-3 bg-stone-800 text-white rounded-lg font-bold hover:bg-stone-700 transition-colors"
            >
                Rerun Diagnostics
            </button>
        </div>
    );
};

export default Diagnostics;
