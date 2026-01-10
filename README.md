# x402 News & Sentiment API

A real-time news and sentiment analysis API protected by **x402 micropayments** on Base.

Pay **$0.005 USDC** per request — no subscription, no account needed.

Perfect for AI agents, bots, or personal use.

## Endpoints

### 1. News Summary

GET /summarize?topic=[topic]&limit=[1-20]

**Example**
```bash
curl "https://news-summarizer-x402.vercel.app/summarize?topic=bitcoin&limit=10"

Response (after payment)

{
  "topic": "bitcoin",
  "summary": "Bitcoin price has surged past $100K following ETF approvals and institutional adoption...",
  "key_points": ["ETF inflows hit record", "Institutional buying drives rally"],
  "sources": [
    {"title": "Bitcoin ETF News", "url": "https://..."}
  ]
}

2. Sentiment Analysis

GET /sentiment?topic=[topic]&limit=[1-50]

Example

curl "https://news-summarizer-x402.vercel.app/sentiment?topic=bitcoin&limit=20"

Response (after payment)

{
  "topic": "bitcoin",
  "sentiment": "positive",
  "explanation": "Recent articles highlight strong institutional adoption and ETF inflows...",
  "key_points": ["Bitcoin ETF approvals boost prices", "..."]
}

Payment Details

Price: $0.005 USDC per request
Chain: Base mainnet
Receiving wallet: 0x19B1614Ee8272178d09CdDC892FAa2c8cCB91268
Powered by: x402 + Coinbase CDP facilitator

Initial Response (Unpaid)

{
  "title": "Payment Required",
  "status": 402,
  "detail": "Payment required to access this resource",
  "payment_required": {
    "accepts": [
      {
        "scheme": "exact",
        "price": "$0.005",
        "network": "base",
        "payTo": "0x19B1614Ee8272178d09CdDC892FAa2c8cCB91268",
        "asset": "USDC"
      }
    ]
  }
}

How to Use

Hit any endpoint → receive 402 Payment Required.
Pay with an x402-compatible wallet (e.g., Coinbase Wallet).
Receive the full JSON response with AI-powered content.

Built With

Node.js + Express
x402-express + @coinbase/x402
TheNewsAPI.com (news data)
Hugging Face (Llama-3.1-Instruct for summarization & sentiment)

Active MVP — accepting real micropayments! 🚀
Made in January 2026