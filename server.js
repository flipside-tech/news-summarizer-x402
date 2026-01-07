import express from 'express';
import axios from 'axios';
import path from 'path';
import { paymentMiddleware } from 'x402-express';
import { facilitator } from '@coinbase/x402';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const WALLET_ADDRESS = '0x19B1614Ee8272178d09CdDC892FAa2c8cCB91268';

app.use(paymentMiddleware(
  WALLET_ADDRESS,
  {
    'GET /summarize': {
      price: '$0.005',
      network: 'base',
      description: 'Real-time news summary'
    }
  },
  facilitator
));

app.get('/summarize', async (req, res) => {
  const { topic = 'world', limit = 10 } = req.query;

  let summary = 'Summary generation failed (fallback)';
  let key_points = [];
  let sources = [];

  try {
    const newsUrl = `https://api.thenewsapi.com/v1/news/all?api_token=${process.env.NEWS_API_TOKEN}&search=${encodeURIComponent(topic)}&limit=${limit}&language=en`;
    const newsResponse = await axios.get(newsUrl);
    const articles = newsResponse.data.data || [];

    if (articles.length === 0) {
      throw new Error('No articles found');
    }

    key_points = articles.map(a => a.title);
    sources = articles.map(a => ({ title: a.title, url: a.url }));

    const rawText = articles.map(a => `${a.title}. ${a.description || ''}`).join(' ');
    const inputText = rawText.slice(0, 2000);

    const hfResponse = await axios.post(
      'https://router.huggingface.co/v1/chat/completions',
      {
        model: 'meta-llama/Llama-3.1-8B-Instruct',
        messages: [
          { role: 'system', content: 'Summarize the news in 3-5 sentences.' },
          { role: 'user', content: inputText }
        ],
        max_tokens: 300
      },
      {
        headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` }
      }
    );

    summary = hfResponse.data.choices[0]?.message?.content?.trim() || summary;
  } catch (error) {
    console.error('Endpoint error:', error.message || error);
    summary = 'Summary generation failed — try again later';
  } finally {
    res.json({
      topic,
      summary,
      key_points,
      sources
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});