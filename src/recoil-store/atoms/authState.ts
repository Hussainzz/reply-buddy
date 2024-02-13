import { atom } from "recoil";

export const isLoggedInAtom = atom<Boolean>({
  key: "isLoggedIn", 
  default: false,
});
