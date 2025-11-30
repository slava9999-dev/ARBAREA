import { useEffect, useRef } from 'react';

const TelegramLoginButton = ({ onAuth, botName = 'Arbarea_bot' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    console.log('🔵 Loading Telegram widget for bot:', botName);
    
    // Create the script element
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'false');
    script.async = true;

    // Define the global callback
    window.onTelegramAuth = (user) => {
      console.log('🔵 Telegram widget callback triggered:', user);
      onAuth(user);
    };
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    script.onload = () => {
      console.log('✅ Telegram widget loaded successfully');
    };
    
    script.onerror = (error) => {
      console.error('❌ Failed to load Telegram widget:', error);
    };

    // Append to container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(script);
    }

    // Cleanup
    return () => {
      delete window.onTelegramAuth;
    };
  }, [onAuth, botName]);

  return (
    <div className="flex justify-center my-4" ref={containerRef}>
      {/* Widget will be rendered here */}
    </div>
  );
};

export default TelegramLoginButton;
