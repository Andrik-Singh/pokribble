import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import InputName from "../components/appearance/InputName";
import AvatarSelection from "../components/appearance/AvatarSelection";
import { useAvatarChange } from "../zustand/avatar";
import { pokemonNames } from "../utils/randomNumbers";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

let floaterId = 0;
const skribblRules = [
  "One player draws a word while others guess it in the chat",
  "The drawing player picks from 3 random words to draw",
  "Players earn points for guessing correctly — faster guesses earn more points",
  "The drawer also earns points when others guess their drawing",
  "Each player takes turns drawing once per round",
  "You cannot say the word directly in the chat while guessing",
  "Hints reveal letters of the word over time",
  "The game lasts a set number of rounds chosen before the game starts",
  "The player with the most points at the end wins",
  "You can only use the drawing tools provided — brush, fill, eraser, shapes",
];
const images = "./assets/bg-1.png";

const App = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const setAvatar = useAvatarChange(
    (s: { setAvatar: (avatar: string) => void }) => s.setAvatar,
  );
  const [floaters, setFloaters] = useState<
    {
      id: number;
      img: string;
      y: number;
      duration: number;
      size: number;
      pokemonId: number;
    }[]
  >([]);
  const [index, setIndex] = useState(0);
  const floaterIdRef = useRef(floaterId);

  const getSpriteUrl = useCallback(
    (id: number) =>
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    [],
  );

  useEffect(() => {
    const spawnImage = () => {
      const id = floaterIdRef.current++;
      const pokemonId = Math.floor(Math.random() * 151) + 1;
      const img = getSpriteUrl(pokemonId);
      const y = Math.random() * 85;
      const duration = 15 + Math.random() * 10;
      const size = 80 + Math.floor(Math.random() * 60);
      setFloaters((prev) => [
        ...prev,
        { id, img, y, duration, size, pokemonId },
      ]);

      setTimeout(
        () => {
          setFloaters((prev) => prev.filter((f) => f.id !== id));
        },
        (duration + 1) * 1000,
      );
    };

    spawnImage();
    const interval = setInterval(spawnImage, 5000);
    return () => clearInterval(interval);
  }, [getSpriteUrl]);

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(rgba(255, 230, 200, 0.3), rgba(20, 10, 0, 0.6)), url(${images})`,
        backgroundSize: "150vmax auto",
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        animationName: "slowTraverse",
        animationDuration: "60s",
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        animationPlayState: isPaused ? "paused" : "running",
      }}
      className="bg-[#1a120b] h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden gap-8"
    >
      <h1 className="font-mono text-6xl text-yellow-400 drop-shadow-[0_5px_0_rgba(200,80,0,1)] tracking-widest">
        Pokribble
      </h1>
      <div className="bg-[#fdfcf0] border-4 border-[#3c2a21] p-6 rounded-sm shadow-[8px_8px_0px_0px_rgba(60,42,33,1)] z-10 w-80 flex flex-col gap-6 relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-polka.png')]"></div>

        <div className="relative z-10">
          <InputName />
        </div>
        <AvatarSelection />
        <button
          disabled={loading}
          onClick={async () => {
            try {
              setLoading(true);
              const res = await fetch(`${backendUrl}/create-new-game`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({}),
              });
              if (!res.ok) {
                throw new Error("Server failed");
              }
              const data = await res.json();
              if (data) navigate(`/game/${data.id}`);
            } catch (error) {
              console.error(error);
            } finally {
              setLoading(false);
            }
          }}
          className="relative bg-[#e64a19] hover:bg-[#ff5722] text-white font-bold py-3 px-6 border-b-4 border-[#8d2d10] active:border-b-0 active:translate-y-1 transition-all rounded-sm uppercase tracking-tighter disabled:opacity-50"
        >
          {loading ? "Loading..." : "New Game"}
        </button>
      </div>
      <div className="z-30 w-[340px]">
        <div className="bg-[#3c2a21] text-[#fdfcf0] px-3 py-1 text-xs font-bold w-fit rounded-t-md border-x-2 border-t-2 border-[#3c2a21]">
          TRAINER TIPS
        </div>
        <div className="bg-white border-4 border-[#3c2a21] p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] rounded-b-md rounded-tr-md flex items-center gap-2">
          <button
            onClick={() =>
              setIndex(
                (prev) =>
                  (prev - 1 + skribblRules.length) % skribblRules.length,
              )
            }
            className="hover:bg-gray-100 p-1 rounded transition-colors text-2xl font-bold text-[#3c2a21]"
          >
            ‹
          </button>

          <div className="flex-1 text-center py-2">
            <p className="text-[13px] leading-tight font-medium text-slate-800 min-h-[48px] flex items-center justify-center">
              "{skribblRules[index]}"
            </p>
            <div className="flex justify-center gap-1 mt-2">
              {skribblRules.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-orange-500" : "bg-gray-200"}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => setIndex((prev) => (prev + 1) % skribblRules.length)}
            className="hover:bg-gray-100 p-1 rounded transition-colors text-2xl font-bold text-[#3c2a21]"
          >
            ›
          </button>
        </div>
      </div>
      {floaters.map((floater) => (
        <div
          role="button"
          onClick={() => {
            setAvatar(pokemonNames[floater.pokemonId - 1]);
            window.localStorage.setItem(
              "pokribble-avatar",
              pokemonNames[floater.pokemonId - 1],
            );
          }}
          key={floater.id}
          className="absolute left-0 flex flex-col items-center opacity-80 cursor-pointer"
          style={{
            top: `${floater.y}%`,
            animation: `floatAcross ${floater.duration}s linear forwards`,
          }}
        >
          <img
            src={floater.img}
            width={floater.size}
            height={floater.size}
            className="[image-rendering:pixelated] [animation:bob_2.5s_ease-in-out_infinite] brightness-110 contrast-110 drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]"
          />
        </div>
      ))}
    </div>
  );
};

export default App;
