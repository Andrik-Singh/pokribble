import { create } from "zustand";

type TAvatarState = {
  avatar: string;
  setAvatar: (avatar: string) => void;
};

export const useAvatarChange = create<TAvatarState>((set) => ({
  avatar: "",
  setAvatar: (avatar: string) => set({ avatar }),
}));
