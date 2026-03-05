import { WebSocket } from "ws";

type Players = {
  playerId: string;
  score: number;
  socketReference?: WebSocket;
  name: string;
};
type Settings = {
  maxPlayers: number;
  generation: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];
  maxTime:number;
  maxRounds:number;
};
export type Room = {
  players: Map<string, Players>;
  started: boolean;
  settings: Settings;
  sockets: Map<string, WebSocket>;
};
export const room = new Map<string, Room>();
const prefixes = [
  "Shadow",
  "Storm",
  "Blaze",
  "Frost",
  "Thunder",
  "Crimson",
  "Void",
  "Neon",
  "Lunar",
  "Solar",
  "Toxic",
  "Phantom",
  "Savage",
  "Mystic",
  "Hyper",
];
const middles = [
  "Fang",
  "Claw",
  "Wing",
  "Scale",
  "Blade",
  "Strike",
  "Burst",
  "Pulse",
  "Force",
  "Edge",
  "Spike",
  "Drift",
  "Shift",
  "Surge",
  "Flux",
];
const suffixes = [
  "Wolf",
  "Drake",
  "Hawk",
  "Viper",
  "Tiger",
  "Lynx",
  "Raven",
  "Cobra",
  "Hydra",
  "Fenrir",
  "Wyvern",
  "Specter",
  "Wraith",
  "Titan",
  "Golem",
];

const Namepick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const functionPick=(arr:(()=>string)[])=> {
    const name=arr[Math.floor(Math.random() * arr.length)]
    return name()
}
export const generateName = () => {
  const patterns:(()=>string)[] = [
    () => `${Namepick(prefixes)}${Namepick(suffixes)}`,
    () => `${Namepick(prefixes)}${Namepick(middles)}`,
    () => `${Namepick(middles)}${Namepick(suffixes)}`,
    () => `${Namepick(prefixes)}${Namepick(middles)}${Namepick(suffixes)}`,
  ];
  const name=functionPick(patterns)
  const num = Math.random() < 0.5 ? Math.floor(Math.random() * 999) : "";
  return `${name}${num}`;
};
