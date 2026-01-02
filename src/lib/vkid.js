/**
 * VK ID SDK Integration for React
 *
 * Поддерживает:
 * - ВКонтакте
 * - Одноклассники (если включено)
 * - Mail.ru (если включено)
 */

// VK ID App Configuration
export const VKID_CONFIG = {
  appId: 54413816,
  redirectUrl: 'https://arbarea-bice.vercel.app/',
  scope: '', // Empty scope as per working snippet (was 'email phone')
};

// Load VK ID SDK script
export const loadVKIDScript = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.VKIDSDK) {
      resolve(window.VKIDSDK);
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="@vkid/sdk"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.VKIDSDK));
      existingScript.addEventListener('error', reject);
      return;
    }

    // Load script
    const script = document.createElement('script');
    // Use the specific version tag requested by user
    script.src = 'https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js';
    script.async = true;
    script.onload = () => {
      if (window.VKIDSDK) {
        resolve(window.VKIDSDK);
      } else {
        reject(new Error('VK ID SDK not loaded'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load VK ID SDK'));
    document.head.appendChild(script);
  });
};

// Initialize VK ID
export const initVKID = async () => {
  await loadVKIDScript();

  const VKID = window.VKIDSDK;
  if (!VKID)
    throw new Error('VK ID SDK loaded but window.VKIDSDK is undefined');

  // Verify critical properties exist
  if (!VKID.Config || !VKID.ConfigResponseMode) {
    console.error('VK SDK Structure:', VKID);
    throw new Error('VK ID SDK missing Config or ConfigResponseMode');
  }

  VKID.Config.init({
    app: VKID_CONFIG.appId,
    redirectUrl: VKID_CONFIG.redirectUrl,
    responseMode: VKID.ConfigResponseMode.Callback,
    source: VKID.ConfigSource.LOWCODE,
    scope: VKID_CONFIG.scope,
  });

  return VKID;
};

// Exchange code for user data
export const exchangeVKCode = async (code, deviceId) => {
  const VKID = window.VKIDSDK;
  if (!VKID) throw new Error('VK ID SDK not initialized');

  return await VKID.Auth.exchangeCode(code, deviceId);
};

// Get user info from VK ID token
export const getVKUserInfo = async (accessToken) => {
  try {
    const response = await fetch(
      `https://api.vk.com/method/users.get?access_token=${accessToken}&v=5.131&fields=photo_200,email,phone`,
    );
    const data = await response.json();

    if (data.response?.[0]) {
      return data.response[0];
    }
    throw new Error('Failed to get user info');
  } catch (error) {
    console.error('VK user info error:', error);
    throw error;
  }
};
