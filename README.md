# AI Client Acquisition Engine - Backend

Minimal Node.js + Express backend for the AI Client Acquisition Engine.

## What It Does

This service exposes one endpoint:

- `POST /api/generate`

It accepts:

- `industry`
- `location`
- `service`

It then:

- builds a prompt for Claude
- calls the Anthropic API
- returns structured JSON for the frontend

If `ANTHROPIC_API_KEY` is not set, it falls back to a mock response so the app still works for demos and local testing.

## Architecture

The backend is intentionally small:

1. `Express` handles HTTP requests.
2. `cors` allows the frontend to call the API from another port.
3. `dotenv` loads environment variables from `backend/.env`.
4. `@anthropic-ai/sdk` calls Claude.
5. The server returns JSON directly to the frontend.

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
  "service": "SEO"
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
2. A prompt is generated from the input fields.
3. If no API key exists, a deterministic mock response is returned.
4. If the API key exists, Claude is called with a strict JSON instruction.
5. The response text is extracted and parsed.
6. The parsed JSON is sent back to the frontend.

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
    "service": "SEO"
  }'
```

## Knowledge Notes

- The Claude response must be valid JSON because the frontend expects a structured payload.
- The mock fallback is useful for demos, onboarding, and offline development.
- CORS is enabled so the React frontend can run on a separate port.

## Future Improvements

- Use a stricter schema validator for the response.
- Add retry logic for transient API failures.
- Stream Claude output for a faster UX.
- Add rate limiting and request logging.
- Save generated reports to a database.
- Add authentication if this becomes a multi-user tool.

## Production Notes

Before production:

- move secrets into a secure secret manager
- rotate the API key if it was ever exposed
- add monitoring and error tracking
- validate and sanitize inputs more strongly
- consider schema enforcement for all AI responses

