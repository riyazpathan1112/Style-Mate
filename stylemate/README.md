# StyleMate — AI-Powered Outfit Recommendation System

> Built with **Node.js · Express · React · Claude AI (Anthropic)**

StyleMate is a full-stack AI outfit recommendation engine that generates personalised outfit suggestions based on your wardrobe inventory, style preferences, and occasion type.

---

## Features

- **AI Outfit Recommendations** — Claude AI picks the best outfit from your wardrobe for any occasion
- **Wardrobe Manager** — Add, view, and remove clothing items via REST API
- **Style Advisor Chat** — Conversational AI stylist grounded in your actual wardrobe
- **Style Personas** — Minimal / Bold / Classic / Streetwear styling modes
- **Weather-aware** — Recommendations adapt to weather conditions

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Backend  | Node.js, Express.js, REST API     |
| Frontend | React 18, Axios, CSS-in-JS        |
| AI       | Anthropic Claude API (claude-opus-4-5) |
| DevOps   | Nodemon, Concurrently, dotenv     |

---

## Project Structure

```
stylemate/
├── server/                    # Express backend
│   ├── index.js               # App entry point
│   ├── routes/
│   │   ├── wardrobe.js        # GET/POST/PUT/DELETE /api/wardrobe
│   │   ├── outfit.js          # POST /api/outfit/recommend
│   │   └── chat.js            # POST /api/chat
│   ├── controllers/
│   │   ├── wardrobeController.js
│   │   ├── outfitController.js
│   │   └── chatController.js
│   ├── data/
│   │   └── wardrobeStore.js   # In-memory store (swap for MongoDB)
│   └── .env.example
├── client/                    # React frontend
│   ├── public/index.html
│   └── src/
│       ├── App.jsx            # Root layout + tab navigation
│       ├── index.css          # Global design tokens
│       ├── services/api.js    # Axios API layer
│       ├── hooks/useWardrobe.js
│       └── components/
│           ├── RecommendTab.jsx
│           ├── WardrobeTab.jsx
│           └── ChatTab.jsx
└── package.json               # Root scripts
```

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/stylemate.git
cd stylemate
npm run install:all
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env and add your Anthropic API key
```

```env
PORT=5000
ANTHROPIC_API_KEY=your_key_here
CLIENT_URL=http://localhost:3000
```

Get your API key at: https://console.anthropic.com

### 3. Run the app

```bash
# From root — starts both server and client
npm run dev
```

- **Backend** → http://localhost:5000
- **Frontend** → http://localhost:3000

---

## API Reference

### Wardrobe

| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| GET    | /api/wardrobe        | Get all items        |
| POST   | /api/wardrobe        | Add new item         |
| PUT    | /api/wardrobe/:id    | Update item          |
| DELETE | /api/wardrobe/:id    | Remove item          |

**POST /api/wardrobe** body:
```json
{ "type": "Blazer", "color": "Grey", "brand": "Zara", "tags": ["formal"] }
```

### Outfit Recommendation

**POST /api/outfit/recommend**
```json
{
  "occasion": "Office",
  "stylePersona": "classic",
  "weather": "Mild"
}
```

### Chat

**POST /api/chat**
```json
{
  "messages": [
    { "role": "user", "content": "What should I wear to an interview?" }
  ]
}
```

---

## Production Notes

- Replace `wardrobeStore.js` with MongoDB or PostgreSQL for persistence
- Add JWT authentication for multi-user support
- Deploy backend to Railway / Render, frontend to Vercel

---

## Author

**Riyazkhan Pathan** — [LinkedIn](https://linkedin.com/in/riyazkhan-pathan) · [GitHub](https://github.com/YOUR_USERNAME)
