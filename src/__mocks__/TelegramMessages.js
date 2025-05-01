export const sendToTelegram = async (name, email, message) => {
  const response = await fetch('https://api.telegram.org/bot<YOUR_BOT_API>/sendMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: '<YOUR_CHAT_ID>',
      text: `New feedback received: 
      Name: ${name} 
      Email: ${email} 
      Message: ${message}`,
    }),
  });

  if (!response.ok) {
    throw new Error('Error sending message to Telegram');
  }
};
