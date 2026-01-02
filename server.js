import express from 'express';
import axios from 'axios';
import { paymentMiddleware } from 'x402-express';
import { facilitator } from '@coinbase/x402';

const app = express();
const PORT = process.env.PORT || 3000;

// === REPLACE THESE ===
const NEWS_API_TOKEN = 'GSYK6v23j11u7tE7NmWKpU5RRmNzQOi5b1JfugHM';
const WALLET_ADDRESS = '0x19B1614Ee8272178d09CdDC892FAa2c8cCB91268';  // Real base wallet (mainnet or sepolia)

// app.use(paymentMiddleware(
//   WALLET_ADDRESS,
//   {
//     'GET /summarize': {
//       price: '$0.005',
//       network: 'base',  // 'base' for mainnet, 'base-sepolia' for testnet
//       description: 'Real-time news summary'
//     }
//   },
//   facilitator  // Coinbase CDP facilitator
// ));

app.get('/summarize', async (req, res) => {
  const { topic = 'world', limit = 10 } = req.query;

  try {
    const newsUrl = `https://api.thenewsapi.com/v1/news/all?api_token=${process.env.NEWS_API_TOKEN}&search=${encodeURIComponent(topic)}&limit=${limit}&language=en`;
    const newsResponse = await axios.get(newsUrl);
    const articles = newsResponse.data.data || [];

    if (articles.length === 0) {
      return res.status(404).json({ error: 'No articles found' });
    }

    // Prepare raw text from articles for AI summarization
    const rawText = articles
      .map(a => `${a.title}. ${a.description || ''}`)
      .join(' ');

    // Truncate to safe length for Hugging Face free tier
    const inputText = rawText.slice(0, 2000);

    let summary = 'Summary generation failed (fallback)';

    // Try Hugging Face AI summarization
    try {
      try {
  const hfResponse = await axios.post(
    'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
    {
      inputs: inputText,
      parameters: { max_length: 200, min_length: 50, do_sample: false }
    },
    {
      headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` }
    }
  );

  summary = hfResponse.data[0]?.summary_text || summary;
} catch (hfError) {
  console.error('Hugging Face error:', hfError.message);
  summary = articles.map(a => `• ${a.title}`).join('\n');
}

      summary = hfResponse.data[0]?.summary_text || summary;
    } catch (hfError) {
      console.error('Hugging Face error:', hfError.message);
      // Fallback: simple bullet list of titles
      summary = articles.map(a => `• ${a.title}`).join('\n');
    }

    // Return response with AI-powered summary
    res.json({
      topic,
      summary,  // Now much smarter!
      key_points: articles.map(a => a.title),
      sources: articles.map(a => ({ title: a.title, url: a.url }))
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});