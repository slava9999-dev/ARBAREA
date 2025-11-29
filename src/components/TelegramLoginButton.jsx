import { signInWithCustomToken } from 'firebase/auth';
import { useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { auth } from '../lib/firebase';

const TelegramLoginButton = ({ botName = 'ArbareaBot', onAuthSuccess }) => {
  const containerRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Check if script is already loaded
    if (containerRef.current && containerRef.current.innerHTML === '') {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', botName);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '12');
      script.setAttribute('data-request-access', 'write');
      script.setAttribute('data-userpic', 'false');
      script.async = true;

      // Define the callback function globally
      window.onTelegramAuth = async (user) => {
        try {
          // Send data to backend for verification and token generation
          const response = await fetch('/api/auth-telegram', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Authentication failed');
          }

          // Sign in with custom token
          await signInWithCustomToken(auth, data.customToken);

          showToast('Успешный вход через Telegram', 'success');
          if (onAuthSuccess) onAuthSuccess(data.user);
        } catch (error) {
          console.error('Telegram login error:', error);
          showToast('Ошибка входа через Telegram', 'error');
        }
      };

      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      containerRef.current.appendChild(script);
    }
  }, [botName, showToast, onAuthSuccess]);

  return <div ref={containerRef} className="flex justify-center" />;
};

export default TelegramLoginButton;
