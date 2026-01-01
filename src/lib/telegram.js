export const sendTelegramNotification = async (text, token) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch('/api/send-telegram', {
      method: 'POST',
      headers,
      body: JSON.stringify({ message: text }),
    });
    return await response.json();
  } catch (error) {
    console.error('Telegram notification error:', error);
    return { success: false, error: error.message };
  }
};
