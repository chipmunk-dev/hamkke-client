import { atom } from 'jotai';

export interface UserInfo {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
}

export const userInfoAtom = atom<UserInfo | null>(null);