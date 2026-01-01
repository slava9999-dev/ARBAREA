export const sendMessageToGemini = async (history, newMessage, token) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        history,
        message: newMessage,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return 'Простите, сейчас я не могу ответить. Попробуйте позже.';
    }

    return data.reply || 'Хм, я задумался. Спросите еще раз?';
  } catch (error) {
    console.error('Network Error:', error);
    return 'Ошибка соединения. Проверьте интернет.';
  }
};
