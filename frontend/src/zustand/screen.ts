import { create } from "zustand";
import type { PokemonDescription, Room } from "../types";
type Screen =
  | {
      type: "Room_Update";
      room: Partial<Room>;
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
    }
  | {
      type: "Guess_Result";
      correct: boolean;
      distance?: number;
    }
  | {
      type: "Hint";
      hint: string;
    }
  | {
      type: "Setting_Up";
    }| null;
type ScreenState = {
    screen:Screen,
    setScreen:(screen:Screen)=>void
}
export const useScreenChange=create<ScreenState>((set)=>({
    screen:null,
    setScreen:(screen)=>set({screen})
}))