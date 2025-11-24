export const sendTelegramNotification = async (text) => {
    try {
        const response = await fetch('/api/telegram-notify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });
        return await response.json();
    } catch (error) {
        console.error('Telegram notification error:', error);
    }
};
