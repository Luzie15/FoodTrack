import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const key = process.env.VITE_GEMINI_API_KEY;

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contents: [{ parts: [{ text: 'Hello' }] }] })
})
  .then(r => r.json())
  .then(d => fs.writeFileSync('models.json', JSON.stringify(d, null, 2)));
