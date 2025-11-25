export const sendTelegramNotification = async (text) => {
    try {
        const response = await fetch('/api/send-telegram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: text })
        });
        return await response.json();
    } catch (error) {
        console.error('Telegram notification error:', error);
        return { success: false, error: error.message };
    }
};
