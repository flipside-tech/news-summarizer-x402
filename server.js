import express from 'express';
import axios from 'axios';
import { fileURLToPath } from 'url';
import path from 'path';
import { paymentMiddleware } from 'x402-express';
import { facilitator } from '@coinbase/x402';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Optional root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === REPLACE THESE ===
const WALLET_ADDRESS = '0x19B1614Ee8272178d09CdDC892FAa2c8cCB91268';  // Real base wallet (main or sepolia)

app.use(paymentMiddleware(
  WALLET_ADDRESS,
  {
    'GET /summarize': {
      price: '$0.005',
      network: 'base',  // 'base' for mainnet, 'base-sepolia' for testnet
      description: 'Real-time news summary'
    },
    'GET /sentiment': {  // <-- New route
      price: '$0.005',
      network: 'base',
      description: 'Sentiment analysis of recent news'
    },
    'GET /meme': { 
        price: '$0.005', 
        network: 'base', 
        description: 'Generate a meme' 
    }
  },
  facilitator  // Coinbase CDP facilitator
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

    summary = hfResponse.data.choices[0]?.message?.content?.trim().replace(/\\n/g, '\n') || summary;
  } catch (error) {
    console.error('Endpoint error:', error.message || error);
    summary = 'Summary currently unavailable — please try again in a moment';
    key_points = key_points || [];
    sources = sources || [];
  }

  // Always return valid JSON with explicit topic
  res.json({
    topic: topic,  // Explicitly use the query topic (never overridden)
    summary,
    key_points,
    sources
  });
});

app.get('/sentiment', async (req, res) => {
  const { topic = 'world', limit = 20 } = req.query;

  let sentiment = 'neutral';
  let explanation = 'No data available';
  let key_points = [];

  try {
    const newsUrl = `https://api.thenewsapi.com/v1/news/all?api_token=${process.env.NEWS_API_TOKEN}&search=${encodeURIComponent(topic)}&limit=${limit}&language=en`;
    const newsResponse = await axios.get(newsUrl);
    const articles = newsResponse.data.data || [];

    if (articles.length === 0) {
      throw new Error('No articles found');
    }

    key_points = articles.map(a => a.title);

    const rawText = articles.map(a => `${a.title}. ${a.description || ''}`).join(' ');
    const inputText = rawText.slice(0, 2000);

    // Hugging Face sentiment analysis
    const hfResponse = await axios.post(
      'https://router.huggingface.co/v1/chat/completions',
      {
        model: 'meta-llama/Llama-3.1-8B-Instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a financial news sentiment analyst. Analyze the overall sentiment as positive, negative, or neutral. Provide a brief explanation.'
          },
          {
            role: 'user',
            content: `Analyze sentiment for "${topic}" based on these recent articles:\n\n${inputText}`
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      },
      {
        headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` }
      }
    );

    const analysis = hfResponse.data.choices[0]?.message?.content?.trim() || '';

    // Clean escaped newlines and parse sentiment
    const cleanAnalysis = analysis.replace(/\\n/g, '\n').trim();

    const lowerAnalysis = cleanAnalysis.toLowerCase();
    if (lowerAnalysis.includes('positive')) sentiment = 'positive';
    else if (lowerAnalysis.includes('negative')) sentiment = 'negative';
    else sentiment = 'neutral';

    explanation = cleanAnalysis;
  } catch (error) {
    console.error('Sentiment endpoint error:', error.message);
    explanation = 'Sentiment analysis failed — try again later';
  }

  res.json({
    topic,
    sentiment,
    explanation,
    key_points
  });
});

app.get('/meme', async (req, res) => {
  const { topic = 'bitcoin' } = req.query;

  let memes = [];
  let errorMessage = 'No memes found';

  try {
    // Search for popular memes (adjust query for better results)
    const searchQuery = `${topic} meme`;

    // Use a free meme search API or Google Images proxy (here using a simple approach with known sources)
    // For reliability, we'll use a curated list or direct links — but to make it dynamic:
    // This example returns 3 popular meme URLs (you can expand)

    // Popular Bitcoin memes (hardcoded for reliability — replace with dynamic if needed)
    const bitcoinMemes = [
      'https://i.imgflip.com/2/2k1x3j.jpg',  // HODL meme
      'https://i.imgflip.com/2/1otc7y.jpg',  // Bitcoin to the moon
      'https://i.redd.it/a7z3v0o7b0k61.jpg', // Bitcoin pizza guy
      'https://preview.redd.it/v0q1e5q3f0k61.jpg?width=640&crop=smart&auto=webp&s=example' // Buy the dip
    ];

    // For general topics, fallback or extend
    memes = bitcoinMemes.slice(0, 3);  // Return top 3

    if (memes.length === 0) {
      throw new Error('No memes found for topic');
    }
  } catch (error) {
    console.error('Meme search error:', error.message);
    errorMessage = 'Failed to find memes — try again';
  }

  res.json({
    topic,
    memes,  // Array of image URLs
    error: memes.length === 0 ? errorMessage : null
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});