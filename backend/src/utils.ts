import { WebSocket } from "ws";

type Players = {
  playerId: string;
  score: number;
  socketReference?: WebSocket;
  name: string;
  disconnected: boolean;
  avatar: string;
};
type Settings = {
  maxPlayers: number;
  generation: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)[];
  maxTime: number;
  maxRounds: number;
};
type PokemonDescription = {
  name: string;
  image: string;
  id: number;
};
type Round = {
  pokemon?: PokemonDescription;
  drawerId?: string;
  currentRound: number;
  drawerIndex: number;
  timeRemaining: number;
  timerId?: NodeJS.Timeout;
  correctGuesses: string[];
};
export type Room = {
  players: Map<string, Players>;
  started: boolean;
  gameEnded?: boolean;
  settings: Settings;
  round: Round;
};
export const room = new Map<string, Room>();
const prefixes = [
  "Red",
  "Blue",
  "Ash",
  "Misty",
  "Brock",
  "TeamRocket",
  "Shiny",
  "Mega",
  "Gigantamax",
  "Alpha",
  "Elite",
  "GymLeader",
  "Professor",
];
const middles = [
  "Pika",
  "Char",
  "Squir",
  "Bulba",
  "Jiggly",
  "Gengar",
  "Mew",
  "Eevee",
  "Snor",
  "Lugia",
  "HoOh",
  "Celebi",
  "Ray",
  "Lucar",
  "Grenin",
];
const suffixes = [
  "Trainer",
  "Master",
  "Catcher",
  "Breeder",
  "Ranger",
  "Champion",
  "Rival",
  "Researcher",
  "Collector",
  "Battler",
];

const Namepick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const functionPick = (arr: (() => string)[]) => {
  const name = arr[Math.floor(Math.random() * arr.length)];
  return name();
};
export const generateName = () => {
  const patterns: (() => string)[] = [
    () => `${Namepick(prefixes)}${Namepick(suffixes)}`,
    () => `${Namepick(prefixes)}${Namepick(middles)}`,
    () => `${Namepick(middles)}${Namepick(suffixes)}`,
    () => `${Namepick(prefixes)}${Namepick(middles)}${Namepick(suffixes)}`,
  ];
  const name = functionPick(patterns);
  const num = Math.random() < 0.5 ? Math.floor(Math.random() * 999) : "";
  return `${name}${num}`;
};
export const serializeRoom = (myRoom: Room) =>
  JSON.stringify({
    room: {
      ...myRoom,
      players: Array.from(myRoom.players.values()).map(
        ({ socketReference, ...rest }) => rest,
      ),
      round: {
        ...myRoom.round,
        timerId: undefined,
      },
    },
  });
export function levenshtein(a: string, b: string): number {
  const m = a.length,
    n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);

  return dp[m][n];
}
