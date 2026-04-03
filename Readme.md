# Pokribble

## 1. Project Overview
Pokribble is a multiplayer Pokémon drawing and guessing game inspired by Skribbl.io. Players take turns drawing a randomly selected Pokémon while others attempt to guess its name in the chat. The player who guesses correctly within the time limit earns points, and the drawer earns points when others guess successfully. 

**Tech Stack**:
- **Frontend**: React, Vite, TailwindCSS, Zustand (State Management), React Router, `react-use-websocket`.
- **Backend**: Node.js, Fastify, `@fastify/websocket`, Upstash/Redis, TypeScript.

## 2. Architecture
The application runs on a Client-Server architecture primarily utilizing WebSockets for real-time multiplayer synchronization.

- **REST API**: Used only for initial room creation and loading specific game sessions via `/create-new-game` and `/loadGame`.
- **WebSockets**: The main communication layer. Once a game starts, the frontend establishes a persistent WebSocket connection.
- **Data Flow**:
  - **Room Creation**: User clicks "New Game" -> REST POST to server -> Server creates a room and returns a `roomId` -> Frontend navigates to `/game/:roomId`.
  - **Lobby Phase**: Players join using a shared link. The room host configures settings (Max Players, Generations, Time, Rounds). Broadcasts synchronize the state to all attendees.
  - **Game Loop**: Host starts the game. Server selects a drawer and sends them 3 Pokémon choices (`Pokemon_Chosen` event). Drawer chooses a Pokémon to draw.
  - **Round Lifecycle**: Round begins with a timer. Drawer utilizes the `DrawingBoard` (which emits individual draw events/lines). Other clients receive canvas operations in real-time.
  - **Hints & Guessing**: Non-drawers input guesses. Server calculates the Levenshtein distance: exact match awards points, nearby match hints "close". The server periodically reveals hints based on the Pokémon name.
- **State Management**:
  - *Frontend*: Zustand slices for simple UI states (like Avatar) and `useWebSocket` for handling the real-time Game/Room messages.
  - *Backend*: In-memory `Map<string, Room>` stores all active games, syncing state to all connected players via Broadcast mechanisms.

## 3. Folder Structure
```text
/
├── backend/                  # Fastify server
│   ├── src/
│   │   ├── index.ts          # Entry point, registers plugins and REST routes
│   │   ├── routes/           # REST endpoints (assignGames, loadGames)
│   │   ├── websocketFunctions/ # WebSocket event handlers (guessing, room config)
│   │   ├── pokemon/          # Pokémon-specific logic (Hints, generation, choices)
│   │   ├── redis.ts          # Redis client configuration
│   │   └── utils.ts          # Typings, room states, Levenshtein distance
│   └── package.json
└── frontend/                 # Vite + React app
    ├── src/
    │   ├── components/
    │   │   ├── mainGame/     # Drawing logic, chat input, chat history
    │   │   ├── LobbyGame.tsx # Pre-game waiting room and setting toggles
    │   │   ├── StartedGame.tsx # Wrapper coordinating the board, sidebar
    │   │   └── ScoreBoard.tsx  # Post-game results screen
    │   ├── routes/
    │   │   ├── App.tsx       # Landing page (name & avatar selection)
    │   │   └── Game.tsx      # Main game view handler (switching Lobby/Started/Ended)
    │   ├── zustand/          # Global state management
    │   └── utils/            # Utilities (Pokemon colors, sprite locators)
    └── package.json
```

## 4. Key Concepts & Modules
- **Room/Session Management (`backend/src/utils.ts` and `frontend/src/routes/Game.tsx`)**:
  Games are structured around a `Room` object containing the list of players, room settings, and the current `Round` state.
- **Round Logic (`backend/src/websokcetFunctions/webSocketFunction.ts`)**:
  Governs the start and end of rounds, checks if all users have guessed correctly, handles timer logic down to 0, and manages scores.
- **Drawing Board (`frontend/src/components/mainGame`)**:
  - `ClientDrawingBoard` displays what the drawer is drawing to other players.
  - `DrawingBoard` holds canvas context, drawing logic, and emits point interactions via WebSockets.
- **Socket Events / Message Types**:
  - `Room_Update`: Broadcasts the current room state.
  - `Guess`: A player submits a guess; server responds with `Guess_Result` (correct, distance based on Levenshtein algorithm).
  - `Toggle_Generation` / `Update_Settings`: Lobby configuration updates.
  - `Game_Start` & `Pokemon_Chosen`: Handles the drawer's selection process before the timer runs.
- **Player Roles**:
  - **Drawer**: Has access to canvas tools (brush, eraser, fill, colors). Cannot guess.
  - **Guesser**: Receives canvas coordinates to render. Inputs guesses via `InputBoard`.

## 5. Environment & Setup
**Prerequisites**: Node.js, npm/yarn.

**Backend Setup**:
1. `cd backend`
2. `npm install`
3. Create a `.env` file based on `.env.example` or providing necessary keys:
   - `FRONTEND_URL=http://localhost:5173`
   - Upstash / Redis URLs configured for your provider
4. `npm run dev` to start the Fastify server on port `4000`.

**Frontend Setup**:
1. `cd frontend`
2. `npm install`
3. Create a `.env` file: `VITE_BACKEND_URL=http://localhost:4000`
4. `npm run dev` to start the Vite server.

## 6. Future Improvements / Extension Points
- **Architecture Scalability**: Moving the in-memory `Room` states (`Map<string, Room>`) entirely to Redis to allow the server to scale horizontally across multiple Node instances.
- **New Game Modes**: The `Toggle_Generation` logic indicates easy extensibility to add themed modes (e.g., "Legendaries Only", "Items", "Moves" guessing).
- **Scoring Enhancements**: Modifying `guessPokemon` in backend to account for consecutive streak multipliers or faster guessing multipliers.
- **Hint System Expansion**: Currently using letter reveals. This could be extended to show Pokémon types, region, or silhouette images in `backend/src/pokemon/getPokemonHint.ts`.
