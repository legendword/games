# Legendword Games

An online minigame platform hosting both singleplayer and multiplayer games for anyone to play with ease.

## Games

| Game | Players | Description |
|------|---------|-------------|
| **Landlord** | 3 players | Classic Chinese card game (Dou Di Zhu) with a 54-card deck |
| **Chess** | 2 players | Classic chess with real-time multiplayer |
| **Wordle+** | 1 player | Wordle with customizable word lengths (3-7 letters) |
| **2048** | 1 player | The classic sliding tile puzzle |

Multiplayer games use real-time WebSocket connections, so you can play with friends by sharing a room link.

More games are being added! You can suggest new games by opening an [issue](https://github.com/legendword/games/issues).

## Getting Started

### Local Development with Docker

The easiest way to run the entire project locally:

```bash
docker compose up --build
```

This starts all services:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend (Index) | http://localhost:3000 |
| Backend (Landlord) | http://localhost:3001 |
| Backend (Chess) | http://localhost:3002 |

To stop everything:

```bash
docker compose down
```

### Deploying to a Server

1. Clone the repo on your server:

   ```bash
   git clone https://github.com/legendword/games.git
   cd games
   ```

2. Set `BACKEND_BASE_URL` to your server's public URL so the frontend knows where to reach the backend:

   ```bash
   BACKEND_BASE_URL=https://yourdomain.com docker compose up -d --build
   ```

   Or create a `.env` file in the project root:

   ```env
   BACKEND_BASE_URL=https://yourdomain.com
   ```

   Then run:

   ```bash
   docker compose up -d --build
   ```

3. The frontend will be served on port 8080 and the backend services on ports 3000-3002. Use a reverse proxy (e.g., Nginx, Caddy) in front to handle HTTPS and route traffic to these ports.

To view logs:

```bash
docker compose logs -f
```

To update after pulling new changes:

```bash
git pull
docker compose up -d --build
```

### Manual Setup

If you prefer to run without Docker, you'll need to start the frontend and backend services separately.

#### Prerequisites

- [Node.js](https://nodejs.org/) (v18 recommended)
- npm

#### Backend

```bash
cd backend
npm install
```

Start each backend service in a separate terminal:

```bash
node index.js      # Index service on port 3000
node landlord.js   # Landlord game on port 3001
node chess.mjs     # Chess game on port 3002
```

#### Frontend

```bash
cd frontend
npm install
```

Start the development server with hot-reload:

```bash
npx quasar dev
```

Build for production:

```bash
npx quasar build
```

The production build outputs to `frontend/dist/spa`.

## Project Structure

```
games/
├── frontend/          # Quasar (Vue.js) SPA
│   └── src/
│       ├── pages/     # Page components
│       │   └── games/ # Individual game UIs
│       ├── components/
│       ├── router/
│       └── store/     # Vuex state management
├── backend/           # Node.js + Express + Socket.io
│   ├── index.js       # Index service (health checks, game discovery)
│   ├── landlord.js    # Landlord game server
│   └── chess.mjs      # Chess game server
└── docker-compose.yml
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `BACKEND_BASE_URL` | Base URL for backend services (used during frontend build) | `http://localhost` |

## Tech Stack

- **Frontend:** [Quasar](https://quasar.dev/) (Vue.js), Socket.io Client, Axios
- **Backend:** Node.js, Express, Socket.io, [chess.js](https://github.com/jhlywa/chess.js)
- **Deployment:** Docker, Nginx

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
