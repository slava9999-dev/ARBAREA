/**
 * Утилита для работы с reCAPTCHA Enterprise
 * Ключ сайта: 6LeE9hUsAAAAAHq_EvnGtMdQAy-h27sTESsMLtWK
 */

const SITE_KEY = '6LeE9hUsAAAAAHq_EvnGtMdQAy-h27sTESsMLtWK';

/**
 * Выполняет проверку reCAPTCHA и возвращает токен.
 * @param {string} action - Название действия (например, 'LOGIN', 'SUBMIT_ORDER')
 * @returns {Promise<string>} - Токен reCAPTCHA
 */
export const executeRecaptcha = async (action) => {
  return new Promise((resolve, reject) => {
    if (window.grecaptcha?.enterprise) {
      window.grecaptcha.enterprise.ready(async () => {
        try {
          const token = await window.grecaptcha.enterprise.execute(SITE_KEY, {
            action,
          });
          resolve(token);
        } catch (error) {
          reject(error);
        }
      });
    } else {
      reject(new Error('reCAPTCHA Enterprise not loaded'));
    }
  });
};
