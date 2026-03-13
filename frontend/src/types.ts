type PokemonDescription = {
  name: string;
  image: string;
};
type Round = {
  pokemon?: PokemonDescription;
  drawerId?: string;
  currentRound: number;
  timeRemaining: number;
  correctGuesses?: string[];
};
type Settings = {
  maxPlayers: number;
  generation: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];
  maxTime: number;
  maxRounds: number;
};
type Player = {
  playerId: string;
  score: number;
  name: string;
  disconnected?: boolean;
};
export type Room = {
  players: Player[];
  settings: Settings;
  started: boolean;
  gameEnded?: boolean;
  round: Round;
};
export type RoomResponse = {
  text: string;
  userId: string;
  room: Room;
  userName: string;
};
export type IncomingWebSocketMessage =
  | {
      type: "Room_Update";
      room: Room;
    }
  | {
      type: "Timeout";
      drawerId: string;
      pokemon: PokemonDescription;
    }
  | {
      type: "Return_To_Lobby";
    }
  | {
      type: "Pokemon_Choose";
      text: string;
      pokemon?: PokemonDescription[];
    };

export type OutgoingWebSocketMessage =
  | { type: "Toggle_Generation"; generation: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }
  | {
      type: "Update_Settings";
      settings: Partial<{
        maxPlayers: number;
        generation: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];
        maxTime: number;
        maxRounds: number;
      }>;
    }
  | { type: "Game_Start" }
  | { type: "Pokemon_Chosen"; pokemon: { name: string; image: string } }
  | { type: "Return_To_Lobby" };
