import { useEffect, useRef } from 'react';
import { auth } from '../../lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';

const TelegramLoginButton = ({ onSuccess, onError }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Load Telegram Widget script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'arbarea_orders_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    // Global callback for Telegram
    window.onTelegramAuth = async (user) => {
      try {
        // Send to backend for verification and token creation
        const response = await fetch('/api/telegram-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Telegram auth failed');
        }

        // Sign in to Firebase with custom token
        const userCredential = await signInWithCustomToken(
          auth,
          data.customToken,
        );

        if (onSuccess) onSuccess(userCredential.user);
      } catch (error) {
        if (onError) onError(error);
      }
    };

    return () => {
      delete window.onTelegramAuth;
    };
  }, [onSuccess, onError]);

  return (
    <div ref={containerRef} className="flex justify-center my-4">
      {/* Telegram widget will be injected here */}
    </div>
  );
};

export default TelegramLoginButton;
