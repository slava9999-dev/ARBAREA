import { useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
// import { supabase } from '../lib/supabase'; // Will be used later

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
        console.log('Telegram User:', user);
        showToast('Вход через Telegram временно недоступен', 'info');

        /* 
        TODO: Implement Telegram Auth with Supabase
        1. Send user data to backend
        2. Verify hash
        3. Get/Create user in Supabase
        4. Return session
        */

        /*
        try {
          const response = await fetch('/api/auth-telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
          });

          if (!response.ok) throw new Error('Auth failed');
          
          const { session } = await response.json();
          // supabase.auth.setSession(session);
          
          if (onAuthSuccess) onAuthSuccess(user);
        } catch (error) {
          console.error('Telegram login error:', error);
          showToast('Ошибка входа через Telegram', 'error');
        }
        */
      };

      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      containerRef.current.appendChild(script);
    }
  }, [botName, showToast]);

  return <div ref={containerRef} className="flex justify-center" />;
};

export default TelegramLoginButton;
