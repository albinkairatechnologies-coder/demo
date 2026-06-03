# Kaira — Digital Health Check (website version)

A customer-facing widget that scores any business's online presence and shows a Kaira-branded report. The browser never sees your API key — a small serverless function holds it.

```
kaira-site/
├─ public/index.html      ← what customers see (front-end)
├─ api/health-check.js    ← backend; holds your API key, calls Anthropic
└─ package.json
```

## Deploy on Vercel (free, ~10 minutes)

1. Create a free account at https://vercel.com
2. Put this folder in a GitHub repo (or use the Vercel CLI: `npm i -g vercel`, then run `vercel` inside this folder).
3. In Vercel → your project → **Settings → Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your key from https://console.anthropic.com  (**required**)
   - `ALLOWED_ORIGIN` = your website URL, e.g. `https://kairatech.in` (recommended; keeps others from using your endpoint)
   - `MODEL` = `claude-sonnet-4-6` (optional; use `claude-haiku-4-5-20251001` for lower cost)
4. **Enable web search:** in the Anthropic Console, turn on the Web Search tool for your organisation (Settings).
5. Deploy. Your page is live at `https://your-project.vercel.app`. The function runs at `/api/health-check` automatically.

## Put it on your existing website

- **Easiest — iframe:** paste this where you want the tool to appear:
  ```html
  <iframe src="https://your-project.vercel.app" style="width:100%;height:760px;border:0;border-radius:14px"></iframe>
  ```
- **Or host the page yourself:** keep `index.html` on your site and deploy only `/api/health-check.js`. Then in `index.html` set `const API_URL = "https://your-project.vercel.app/api/health-check";` and set `ALLOWED_ORIGIN` to your site so the call is permitted.

## Before going public — read this

- **Cost & abuse:** each check costs Anthropic tokens **plus** web-search usage. A public, no-login tool can be spammed. The function has a light in-memory rate limit, but for real protection add proper per-IP limiting (Vercel KV / Upstash Redis) and/or a simple captcha (e.g. Cloudflare Turnstile). Start with `ALLOWED_ORIGIN` locked to your domain.
- **Capture the lead:** the biggest value is the customer's phone. Consider making the phone field required, or emailing yourself each submission (add a notification step in the function).
- **Speed:** with web search a check takes ~20–40s. For an instant version, remove the `tools` array in `api/health-check.js` and tell the model to score from the details provided only.

Other hosts work the same way (Netlify Functions, Cloudflare Workers) — only the function wrapper differs; the Anthropic call is identical.
