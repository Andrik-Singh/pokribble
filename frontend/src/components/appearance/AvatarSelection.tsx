import { useEffect, useState } from "react";
import { random151Pokemon, STORAGE_KEY } from "../../utils/randomNumbers";
import { useAvatarChange } from "../../zustand/avatar";

const SPRITE_BASE_URL =
  "https://img.pokemondb.net/sprites/lets-go-pikachu-eevee/normal/";

const capitalize = (str: string) =>
  str.charAt(0).toLocaleUpperCase() + str.slice(1);

const AvatarSelection = () => {
  const avatar = useAvatarChange((s) => s.avatar);
  const setAvatar = useAvatarChange((s) => s.setAvatar);
  const [imgError, setImgError] = useState(false);
  const storeRandomAvatar = (): void => {
    const randomAvatar = random151Pokemon();
    window.localStorage.setItem(STORAGE_KEY, randomAvatar);
    setAvatar(randomAvatar);
  };

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    stored ? setAvatar(stored) : storeRandomAvatar();
    console.log(stored);
    console.log(avatar);
  }, []);

  const handleRandomize = () => {
    setImgError(false);
    storeRandomAvatar();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <h1>Your Current Avatar: {capitalize(avatar)}</h1>
        <button
          onClick={handleRandomize}
          aria-label="Randomize avatar"
          className="bg-[url('/assets/pokemon.png')] cursor-pointer bg-cover bg-center w-10 h-10 active:translate-y-1 transition-all rounded-sm uppercase tracking-tighter disabled:opacity-50"
        />
      </div>

      <div className="flex flex-row items-center gap-2 w-full h-20">
        {avatar && !imgError ? (
          <img
            className="w-20 h-20 object-cover"
            src={`${SPRITE_BASE_URL}${avatar}.png`}
            alt={capitalize(avatar)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded text-xs text-gray-400">
            No sprite
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarSelection;
