# Chain Reaction

A full-stack implementation of the classic Chain Reaction game built with **Next.js 14** (frontend) and **Node.js + Socket.io** (backend).

## Features

- **Hot Seat** – 2–4 players take turns on the same screen
- **vs Computer** – Play against an AI (easy or medium difficulty)
- **Online Multiplayer** – Real-time play via WebSockets with room codes

---

## Quick Start

### Prerequisites
- Node.js 18+

---

### 1. Backend

```bash
cd chain-reaction/backend
npm install
npm run dev        # starts on http://localhost:4000
```

For production:
```bash
npm run build
npm start
```

---

### 2. Frontend

```bash
cd chain-reaction/frontend
npm install
npm run dev        # starts on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> For **Hot Seat** and **vs Computer** you only need the frontend running.  
> For **Online** mode you need both the backend and frontend running.

---

## Project Structure

```
chain-reaction/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express + Socket.io server
│   │   ├── gameEngine.ts     # Core game logic (pure functions)
│   │   ├── roomManager.ts    # Room state & player management
│   │   └── types.ts
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx          # Home screen – mode & player setup
    │   │   └── game/page.tsx     # Game screen
    │   ├── components/
    │   │   ├── Board.tsx         # 9×6 grid
    │   │   ├── Cell.tsx          # Individual cell + orb rendering + animations
    │   │   ├── Sidebar.tsx       # Player list & game stats
    │   │   └── GameOverModal.tsx # Win screen with confetti
    │   ├── hooks/
    │   │   └── useGame.ts        # Central game state hook (local + online)
    │   └── lib/
    │       ├── types.ts
    │       ├── gameEngine.ts     # Pure game logic (shared with backend)
    │       ├── aiPlayer.ts       # Greedy AI with easy/medium difficulty
    │       └── socketClient.ts   # Socket.io client singleton
    ├── package.json
    └── tailwind.config.ts
```

---

## Game Rules

1. Players take turns placing one orb in any **empty cell** or a **cell they already own**.
2. Each cell has a **critical mass** equal to the number of adjacent cells:
   - Corner cell → 2
   - Edge cell → 3
   - Interior cell → 4
3. When a cell reaches its critical mass it **explodes**: all its orbs spread to each neighbour, converting them to the current player's colour.
4. Chain reactions cascade until no cell is overloaded.
5. A player is **eliminated** once they have no orbs left on the board (after everyone has placed their first orb).
6. Last player standing **wins**.

---

## Online Multiplayer

1. Both players open `http://localhost:3000`
2. Player 1 picks **Online → Create Room**, shares the 5-letter code
3. Player 2 picks **Online → Join Room**, enters the code
4. Game starts automatically when the room is full

To host publicly, set the `NEXT_PUBLIC_BACKEND_URL` env variable in the frontend:
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-server.com npm run dev
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:4000` | Backend WebSocket URL |
| `PORT` | `4000` | Backend port |
