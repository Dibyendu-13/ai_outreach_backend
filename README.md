# AI Client Acquisition Engine - Backend

Minimal Node.js + Express backend for the AI Client Acquisition Engine.

## What It Does

This service exposes one endpoint:

- `POST /api/generate`

It accepts:

- `industry`
- `location`
- `service`
- `businessName` optional
- `website` optional

It then:

- enriches the request with live website signals when a `website` is provided
- builds prompts for a multi-agent Claude workflow
- calls the Anthropic API when `ANTHROPIC_API_KEY` is set
- returns structured JSON for the frontend

If `ANTHROPIC_API_KEY` is not set, it falls back to a mock response so the app still works for demos and local testing.

## Architecture

The backend is intentionally small:

1. `Express` handles HTTP requests.
2. `cors` allows the frontend to call the API from another port.
3. `dotenv` loads environment variables from `backend/.env`.
4. `fetch` pulls live website signals when a `website` is supplied.
5. `@anthropic-ai/sdk` calls Claude when an API key is available.
6. The server falls back to a mock response when no API key is configured.
7. The server returns JSON directly to the frontend.

### Request Flow

`Frontend form -> POST /api/generate -> Claude API -> JSON response -> Frontend renders results`

## File

- `server.js` - the full backend implementation in a single file

## API Contract

### `POST /api/generate`

Request body:

```json
{
  "industry": "dentist",
  "location": "New York",
  "service": "SEO",
  "businessName": "Bright Smile Dental",
  "website": "https://example.com"
}
```

Successful response shape:

```json
{
  "businessInsight": {
    "whatTheyLikelyDo": "string",
    "probablePainPoints": ["string", "string", "string"]
  },
  "marketingOpportunities": ["string", "string", "string"],
  "coldEmail": {
    "subject": "string",
    "body": "string"
  },
  "contentIdeas": ["string", "string", "string", "string"]
}
```

Error response:

```json
{
  "error": "message"
}
```

## Environment Variables

Create `backend/.env` locally:

```bash
ANTHROPIC_API_KEY=your_api_key_here
PORT=3001
```

`backend/.env.example` is the template file you can keep in the repo.

## How It Works

1. The request body is validated.
2. A website enrichment step runs if a URL is provided.
3. If no API key exists, a deterministic mock response is returned after enrichment.
4. If an API key exists, the enriched context is passed to three specialist agents.
5. A synthesis agent merges the outputs into the final schema.
6. The response is validated and repaired once if needed.
7. The parsed JSON is sent back to the frontend.

## Running Locally

From the `backend/` folder:

```bash
npm install
cp .env.example .env
npm start
```

For development:

```bash
npm run dev
```

Then test the service at:

- `http://localhost:3001/health`
- `POST http://localhost:3001/api/generate`

## Sample Test

```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "dentist",
    "location": "New York",
    "service": "SEO",
    "businessName": "Bright Smile Dental",
    "website": "https://example.com"
  }'
```

## Knowledge Notes

- The Claude response must be valid JSON because the frontend expects a structured payload.
- The mock fallback is useful for demos, onboarding, and offline development.
- CORS is enabled so the React frontend can run on a separate port.
- If a website is supplied, the backend extracts title, meta description, headings, and page text to ground the agents in real business signals.
- Without `ANTHROPIC_API_KEY`, the backend still works, but it uses the mock schema response instead of Claude.

## Future Improvements

- Use a stricter schema validator for the response.
- Add retry logic for transient API failures.
- Stream Claude output for a faster UX.
- Add rate limiting and request logging.
- Save generated reports to a database.
- Add authentication if this becomes a multi-user tool.
- Enrich from Google search or review APIs in addition to website signals.

## Production Notes

Before production:

- move secrets into a secure secret manager
- rotate the API key if it was ever exposed
- add monitoring and error tracking
- validate and sanitize inputs more strongly
- consider schema enforcement for all AI responses
- add a fallback research path for businesses without websites
