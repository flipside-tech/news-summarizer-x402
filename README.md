# x402 News Summarizer API

A real-time news summary API protected by **x402 micropayments** on Base.

Pay **$0.005 USDC** per request — no subscription, no account needed. Perfect for AI agents, bots, or personal use.

## Endpoint

GET https://your-vercel-url.vercel.app/summarize?topic=[your-topic]&limit=[1-20]

### Example

https://your-vercel-url.vercel.app/summarize?topic=bitcoin&limit=10


### Response (after payment)
```json
{
  "topic": "bitcoin",
  "summary": "Concise summary of latest news...",
  "key_points": [
    "Key point 1",
    "Key point 2"
  ],
  "sources": [
    {
      "title": "Article title",
      "url": "https://..."
    }
  ]
}

Payment

Price: $0.005 USDC per call
Chain: Base mainnet
Powered by x402 + Coinbase CDP facilitator

Local Development

git clone https://github.com/flipside-tech/news-summarizer-x402
cd news-summarizer-x402
npm install
# Set env vars
export CDP_API_KEY_ID='your_id'
export CDP_API_KEY_SECRET='your_secret'
export NEWS_API_TOKEN='your_token'
node server.js

Built With

Node.js + Express
x402-express + @coinbase/x402
TheNewsAPI.com

Status
Active MVP — accepting real micropayments!
Made by flipside-tech — January 2026