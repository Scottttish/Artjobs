const BOT_TOKEN = '7575013321:AAGBNjyLg1SH88N9iybokK4gNYvhsCDBFaw';
const CHAT_ID = '-1002579530875';

export async function sendToTelegram(name, email, message) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const text = `Новое сообщение обратной связи:\n\nИмя: ${name}\nПочта: ${email}\nСообщение: ${message}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'Markdown',
    }),
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.description || 'Failed to send message to Telegram');
  }
}
