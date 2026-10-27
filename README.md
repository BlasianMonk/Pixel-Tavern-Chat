# Pixel Tavern — Real-Time RPG Chat

A full-stack multiplayer pixel-art chat room built with **Node.js, Express, Socket.IO, HTML Canvas, CSS and vanilla JavaScript**. Players choose a sprite, explore three themed rooms, see each other move in real time, and send live messages.

## Features

- Live chat over Socket.IO WebSockets (with Socket.IO transport fallback)
- Real-time multiplayer sprite movement using WASD / arrow keys or click-to-walk
- Three distinct environments: Cozy Tavern, Moonlit Forest, Neon Arcade
- Click another player to wave; chat messages appear as speech bubbles
- Nickname and avatar selection, online presence, typing indicators
- Persistent chat history (last 100 messages per room) stored in `data/messages.json`
- Server-side message length limits, room validation, position clamping, basic rate limiting
- Responsive layout; messages inserted using `textContent` (not unsafe HTML)
- No account required for local demo

## Run locally

Requires Node.js 20+.

```bash
npm install
npm start
```

Open **http://localhost:3000**. Open two tabs or browsers to test multiplayer interactions. `npm run dev` enables automatic server restarts. `npm test` runs the validation tests.

## How it works

`src/server.js` hosts the static frontend and Socket.IO server. Joining a room adds a player to a Socket.IO room; the server broadcasts presence and movement events only to players in that room. Messages are validated on the server, broadcast live, and persisted in a JSON file. The frontend draws the world and characters using Canvas pixel primitives—no external sprite assets are needed.

## Deploy

Use any Node.js host that supports persistent WebSocket connections (e.g. a VPS, Railway, Render, Fly.io). Set `PORT` if required and start with `npm start`. **For persistent messages**, attach a persistent volume and set `DATA_DIR` to that volume. Do not deploy this to GitHub Pages alone: Pages cannot host the Node.js/Socket.IO server.

## Production considerations

This is a portfolio/demo app, not a hardened public social platform. Before public deployment add authentication, moderation/reporting, stronger abuse controls, HTTPS behind a reverse proxy, a database such as PostgreSQL, observability, and appropriate privacy/retention policies. The JSON history store is intended for one Node.js process; for horizontal scaling use a shared database and Socket.IO Redis adapter.

## Project structure

```
public/index.html    Layout and join screen
public/style.css     Responsive RPG UI
public/app.js        Canvas sprites, controls, Socket.IO client
src/server.js        Express server, multiplayer events, persistence
src/shared.js        Input validation helpers
tests/               Unit tests
```

## Resume-ready description

Built a full-stack real-time multiplayer chat application using Node.js, Express, Socket.IO and Canvas. Implemented WebSocket messaging, synchronized character movement, interactive pixel-art environments, room-based presence, typing indicators, and persistent chat history.
