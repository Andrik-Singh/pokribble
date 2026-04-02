export type PokemonDescription = {
  name: string;
  image: string;
  id: number;
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
  avatar: string;
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
      drawer: string;
      pokemon: PokemonDescription;
    }
  | {
      type: "Return_To_Lobby";
    }
  | {
      type: "Pokemon_Choose";
      text: string;
      pokemon?: PokemonDescription[];
    }
  | {
      type: "Guess_Result";
      correct: boolean;
      distance?: number;
    }
  | {
      type: "Hint";
      value: {
        type: string;
        value: string | string[];
      };
    }
  | {
      type: "Setting_Up";
    }
  | [number, number, number, string, number, "pen" | "eraser"];
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
  | {
      type: "Pokemon_Chosen";
      pokemon: { name: string; image: string; id: number };
    }
  | { type: "Return_To_Lobby" };
