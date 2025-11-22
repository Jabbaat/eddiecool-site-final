# Copilot / AI Agent Instructions

Short, actionable guidance to help an AI coding agent be immediately productive in this repository.

- **Big picture:** This repo is primarily a small static website in `docs/` plus a lightweight Python Flask API (`app.py`) used for AI generation. Several small Node backends live under `docs/backend-*` (e.g. `backend-ai-wisdom`, `backend-poem-creator`) that provide specialized endpoints using Google Generative AI. The site can be served statically from `docs/` while dynamic AI features are handled by the Flask app or the Node backends.

- **Key files and what they do:**
  - `app.py` — Flask API that expects `GOOGLE_API_KEY` and uses `langchain-google-genai`. Endpoint: `POST /generate` accepts a `messages` array (LangChain-style messages) and returns `result` JSON.
  - `generate_site.py` — tiny helper that writes a minimal `index.html` (not used for AI logic, only for quick static output).
  - `Procfile` — production entry: `web: gunicorn app:app` (used by Render/Heroku-style deploys).
  - `requirements.txt` — Python dependencies (Flask, langchain related packages, gunicorn). Install with `pip install -r requirements.txt`.
  - `docs/` — static HTML pages (the public site); many features (UI, chess page, galleries) are implemented purely client-side in these files.
  - `docs/backend-*/package.json` and `server.js` — Node backends using `@google/generative-ai` and Express. Run with `npm install` and `npm start` inside the backend folder.

- **Environment variables:**
  - `app.py` requires `GOOGLE_API_KEY` (LangChain/Google GenAI). The Node backends require `GENERATIVE_API_KEY` and `UNSPLASH_ACCESS_KEY` (see `docs/backend-ai-wisdom/server.js`). Agents should not hardcode keys — prefer `.env` locally and check `dotenv` usage.

- **Common developer flows / commands:**
  - Install Python deps: `python -m pip install -r requirements.txt`
  - Run Flask locally (development): `set GOOGLE_API_KEY=...; flask run` (Windows PowerShell: ` $env:GOOGLE_API_KEY='...' ; flask run`) OR use `gunicorn app:app` to mimic production.
  - Start a Node backend (example):
    - `cd docs/backend-ai-wisdom`
    - `npm install`
    - `npm start` (runs `node server.js`)
  - Static site preview: open files under `docs/` in a browser or serve with a static server (e.g. `npx serve docs`).

- **Project-specific patterns / conventions:**
  - The Flask endpoint expects the frontend to POST a `messages` array where each message has `role` and `parts` — the handler converts these to `HumanMessage` / `AIMessage` (see `app.py` lines that map `msg['role']` and `msg['parts'][0]['text']`). Use this format when generating test payloads.
  - Node backends use `@google/generative-ai` and often return small JSON payloads (e.g. `{ saying, imageUrl }`). Keep payloads minimal and parse carefully (see `server.js` which strips markdown fences before JSON.parse).
  - Production deployment expects `gunicorn app:app` (Procfile). The Flask app is intentionally minimal (no local `app.run()`), so prefer using the flask CLI or gunicorn to run it.

- **Integration points & pitfalls to watch for:**
  - Multiple AI SDKs/versions appear: Python uses `langchain-google-genai` and `google-ai-generativelanguage==0.6.15`, Node uses `@google/generative-ai` (v0.14.x / 0.24.x across backends). When changing SDK calls, ensure consistency and test both Python & Node sides.
  - Env var names differ by component. Do not assume a single env var across services. Search for `process.env` in `docs/backend-*` and `os.getenv` in Python files.
  - Static pages in `docs/` may call backend endpoints; when modifying endpoints, update the client-side AJAX/fetch calls in the corresponding HTML/JS files.

- **Examples to copy/paste when testing endpoints:**
  - Flask `generate` test payload (JSON):
    {
      "messages": [
        {"role":"user","parts":[{"text":"Maak een kort video-idee over ruimtevaart"}]}
      ]
    }
  - Node backend run (ai-wisdom):
    - `cd docs/backend-ai-wisdom; npm install; GENERATIVE_API_KEY=... UNSPLASH_ACCESS_KEY=... node server.js`

- **Where to look next:**
  - `app.py` for the canonical AI prompt formatting and system instructions.
  - `docs/` to see front-end integrations and where endpoints are consumed.
  - `docs/backend-*/server.js` for example usages of the Generative AI Node client (error handling patterns, response cleaning).

If you'd like, I can also:
- add short test scripts (curl or Postman examples) for each backend;
- or unify/standardize SDK versions across Python/Node if you want me to propose a plan.

Please tell me if any sections are unclear or if you want the file to include more specific code snippets. 
