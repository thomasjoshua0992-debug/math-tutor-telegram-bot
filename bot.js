require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { solve } = require('./solver');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN. Add it to a .env file (see .env.example).');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const WELCOME = [
  "I'm a math tutor bot. Send me a problem and I'll work through it step by step.",
  '',
  'I can handle:',
  '• Arithmetic — `12 + 5 * (3 - 1)`',
  '• Linear equations — `3x + 5 = 2x - 7`',
  '• Quadratic equations — `x^2 - 5x + 6 = 0`',
  '• Derivatives — `derivative of 3x^3 - 2x + 1`',
  '',
  'Just type a problem to get started.'
].join('\n');

bot.onText(/^\/start$/, (msg) => {
  bot.sendMessage(msg.chat.id, WELCOME);
});

bot.onText(/^\/help$/, (msg) => {
  bot.sendMessage(msg.chat.id, WELCOME);
});

bot.on('message', async (msg) => {
  const text = msg.text;
  if (!text || text.startsWith('/')) return;

  try {
    const result = solve(text);
    const lines = [];
    lines.push(`*Problem:* ${text}`);
    lines.push('');
    result.steps.forEach((step, i) => {
      lines.push(`${i + 1}. ${step}`);
    });
    lines.push('');
    lines.push(`*Answer:* ${result.answer}`);

    await bot.sendMessage(msg.chat.id, lines.join('\n'), { parse_mode: 'Markdown' });
  } catch (err) {
    await bot.sendMessage(
      msg.chat.id,
      "I couldn't work through that one. Try something like `3x + 5 = 2x - 7` or `12 + 5 * 3`, or send /help."
    );
  }
});

console.log('Math tutor bot is running (polling)...');
