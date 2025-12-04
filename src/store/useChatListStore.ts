// src/store/useChatStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './store';

interface ChatCountType {
  id: string | number;
}

interface ChatListState {
  isChatListUpdated: boolean;
  chatCountRate: ChatCountType[];
  setIsChatListUpdated: (updating: boolean) => void;
  setChatCountRate: (chat: ChatCountType) => void;
}

export const useChatListStore = create<ChatListState>()(
  persist(
    (set, get) => ({
      isChatListUpdated: false,
      chatCountRate: [],

      setIsChatListUpdated: (value: boolean) =>
        set({ isChatListUpdated: value }),

      setChatCountRate: (chat: ChatCountType) => {
        const { chatCountRate } = get();
        const exists = chatCountRate.some(item => item.id === chat.id);

        if (!exists) {
          set({
            chatCountRate: [...chatCountRate, chat],
          });
        }
      },
    }),
    {
      name: 'chat-list-storage', // unique storage key
      storage: createJSONStorage(() => zustandStorage), // same storage as useAdsStore
    },
  ),
);
