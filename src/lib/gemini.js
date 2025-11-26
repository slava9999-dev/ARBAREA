export const sendMessageToGemini = async (history, newMessage) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

    return data.text || 'Хм, я задумался. Спросите еще раз?';
  } catch (error) {
    console.error('Network Error:', error);
    return 'Ошибка соединения. Проверьте интернет.';
  }
};
