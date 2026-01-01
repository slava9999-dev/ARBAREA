import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const DebugPWA = () => {
  const [status, setStatus] = useState({
    swRegistered: 'Checking...',
    swActive: 'Checking...',
    beforeInstallPrompt: 'Waiting...',
    isStandalone: 'Checking...',
    isIOS: 'Checking...',
    manifest: 'Loading...',
    https: 'Checking...',
  });

  useEffect(() => {
    const checkStatus = async () => {
      const newStatus = {};

      // 1. HTTPS Check
      newStatus.https =
        window.location.protocol === 'https:' ? '✅ OK' : '❌ Not HTTPS';

      // 2. Service Worker Check
      if ('serviceWorker' in navigator) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          newStatus.swRegistered =
            regs.length > 0 ? `✅ Yes (${regs.length})` : '❌ No registrations';

          const controller = navigator.serviceWorker.controller;
          newStatus.swActive = controller
            ? '✅ Active'
            : '❌ Inactive (Reload page)';
        } catch (e) {
          newStatus.swRegistered = `❌ Error: ${e.message}`;
        }
      } else {
        newStatus.swRegistered = '❌ Not supported';
      }

      // 3. Standalone Check
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone;
      newStatus.isStandalone = isStandalone ? '✅ Yes' : '⬜ Browser Tab';

      // 4. iOS Check
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      newStatus.isIOS = isIOS ? '📱 iOS' : '🤖 Android/Desktop';

      // 5. Manifest Check
      try {
        const res = await fetch('/manifest.webmanifest');
        if (res.ok) {
          const json = await res.json();
          newStatus.manifest = `✅ Found (${json.icons?.length} icons)`;
        } else {
          newStatus.manifest = `❌ Error ${res.status}`;
        }
      } catch (e) {
        newStatus.manifest = `❌ Fetch Error: ${e.message}`;
      }

      setStatus((prev) => ({ ...prev, ...newStatus }));
    };

    checkStatus();

    // Listen for install prompt
    const handler = (e) => {
      e.preventDefault();
      setStatus((prev) => ({
        ...prev,
        beforeInstallPrompt: '✅ Fired! (Installable)',
      }));
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return (
    <div className="min-h-screen bg-stone-900 text-white p-6 pt-24">
      <h1 className="text-2xl font-bold mb-6 text-amber-500">
        PWA Diagnostics
      </h1>

      <div className="space-y-4">
        {Object.entries(status).map(([key, value]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <div className="text-xs text-stone-400 uppercase tracking-wider mb-1">
              {key}
            </div>
            <div
              className={`font-mono ${value.startsWith('✅') ? 'text-green-400' : value.startsWith('❌') ? 'text-red-400' : 'text-stone-200'}`}
            >
              {value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-500/10 rounded-xl text-sm text-blue-300">
        <p>
          Если <strong>beforeInstallPrompt</strong> = "Waiting...", это значит:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Приложение уже установлено</li>
          <li>Браузер "думает" (нужно взаимодействие)</li>
          <li>Service Worker не активен</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="w-full mt-6 bg-stone-800 hover:bg-stone-700 py-3 rounded-lg font-bold"
      >
        Reload Page
      </button>
    </div>
  );
};

export default DebugPWA;
