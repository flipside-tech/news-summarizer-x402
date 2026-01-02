# x402 News Summarizer API

A real-time news summary API protected by **x402 micropayments** on Base.

Pay **$0.005 USDC** per request — no subscription needed.

## Features
- Fresh news summaries
- x402 protection (onchain USDC payments)
- Ideal for AI agents and bots

## Endpoint

GET https://your-vercel-url.vercel.app/summarize?topic=[topic]&limit=[1-20]

## Example Request

```bash
curl "https://your-vercel-url.vercel.app/summarize?topic=bitcoin&limit=10"

{
  "topic": "bitcoin",
  "summary": "Concise summary of latest news...",
  "key_points": ["Point 1", "Point 2"],
  "sources": [
    {"title": "Article Title", "url": "https://..."}
  ]
}
```

## Payment Details

Price: $0.005 USDC
Chain: Base mainnet
Wallet: Your receiving address

## Local Setup

```bash
git clone https://github.com/flipside-tech/news-summarizer-x402.git
cd news-summarizer-x402
npm install
```

## Set env vars

```bash
export CDP_API_KEY_ID='your_id'
export CDP_API_KEY_SECRET='your_secret'
export NEWS_API_TOKEN='your_token'
node server.js
```

## Built With

Node.js + Express
x402-express + @coinbase/x402
TheNewsAPI.com

Active MVP — accepting real micropayments! 🚀
Made in 2026