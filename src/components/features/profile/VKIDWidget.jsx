/**
 * VK ID Login Widget Component
 *
 * Встраивает виджет авторизации VK ID (VK, OK, Mail)
 */

import { useEffect, useRef, useState } from 'react';
import { initVKID, VKID_CONFIG } from '../../../lib/vkid';
import { supabase } from '../../../lib/supabase';
import { Loader2 } from 'lucide-react';

const VKIDWidget = ({
  onSuccess,
  onError,
  providers = ['vkid', 'ok_ru', 'mail_ru'],
}) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    let widget = null;

    const initWidget = async () => {
      try {
        const VKID = await initVKID();

        if (!mounted || !containerRef.current) return;

        // Create OAuth widget
        widget = new VKID.OAuthList();

        widget
          .render({
            container: containerRef.current,
            oauthList: providers.filter((p) => {
              // Only include enabled providers
              if (p === 'vkid') return true;
              if (p === 'ok_ru') return true; // Enable if configured in VK dev console
              if (p === 'mail_ru') return true; // Enable if configured in VK dev console
              return false;
            }),
            styles: {
              height: 44,
              borderRadius: 8,
            },
          })
          .on(VKID.WidgetEvents.ERROR, (err) => {
            console.error('VK ID Widget Error:', err);
            setError('Ошибка загрузки виджета VK ID');
            onError?.(err);
          })
          .on(VKID.OAuthListInternalEvents.LOGIN_SUCCESS, async (payload) => {
            try {
              const { code, device_id: deviceId } = payload;

              // Exchange code for tokens
              const authData = await VKID.Auth.exchangeCode(code, deviceId);

              if (authData?.access_token) {
                // Create session in Supabase with VK data
                await handleVKAuthSuccess(authData);
                onSuccess?.(authData);
              }
            } catch (err) {
              console.error('VK ID Exchange Error:', err);
              setError('Ошибка авторизации через VK ID');
              onError?.(err);
            }
          });

        setIsLoading(false);
      } catch (err) {
        console.error('VK ID Init Error:', err);
        setError('Не удалось загрузить VK ID');
        setIsLoading(false);
      }
    };

    initWidget();

    return () => {
      mounted = false;
      // Cleanup widget if needed
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [onSuccess, onError, providers]);

  // Handle successful VK authentication
  const handleVKAuthSuccess = async (authData) => {
    try {
      // Get user profile from VK
      const response = await fetch(
        `https://api.vk.com/method/users.get?access_token=${authData.access_token}&v=5.131&fields=photo_200,first_name,last_name`,
      );
      const data = await response.json();

      if (data.response?.[0]) {
        const vkUser = data.response[0];

        // Sign in to Supabase using VK data
        // Note: This requires custom auth handling on backend
        // For now, we'll store VK user in localStorage and redirect
        const userData = {
          vk_id: vkUser.id,
          first_name: vkUser.first_name,
          last_name: vkUser.last_name,
          photo: vkUser.photo_200,
          access_token: authData.access_token,
          email: authData.email || null,
          phone: authData.phone || null,
        };

        // Store temporarily
        localStorage.setItem('vk_user', JSON.stringify(userData));

        // Call backend to create/update user session
        await syncVKUserWithSupabase(userData);
      }
    } catch (err) {
      console.error('Failed to process VK user:', err);
      throw err;
    }
  };

  // Sync VK user with Supabase (requires backend endpoint)
  const syncVKUserWithSupabase = async (vkUserData) => {
    try {
      // Call our API to create a session
      // Call our API to create a session
      const response = await fetch('/api/vk-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vkUserData),
      });

      if (response.ok) {
        const data = await response.json();
        // If server returns a session (implementation dependent), use it.
        // Otherwise, reload or show success.
        if (data.session) {
          await supabase.auth.setSession(data.session);
        } else if (data.success) {
          // Fallback: If we synced but don't have a session,
          // we might need to redirect to standard login or refresh
          console.log('VK User Synced:', data);
          // window.location.reload(); // Simple reload to refresh state if cookies were set (unlikely)
        }
      }
    } catch (err) {
      console.error('Failed to sync VK user:', err);
      // Continue anyway - user data is stored locally
    }
  };

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-amber-500 text-sm mt-2 hover:underline"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="vkid-widget-container">
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="animate-spin text-stone-400" size={24} />
        </div>
      )}
      <div
        ref={containerRef}
        className="vkid-widget"
        style={{ minHeight: isLoading ? 0 : 44 }}
      />
    </div>
  );
};

export default VKIDWidget;
