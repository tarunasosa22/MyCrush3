// src/store/useChatStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './store';

interface ChatCount {
  id: string | number;
}

interface ChatState {
  isChatListUpdated: boolean;
  chatCountRate: ChatCount[];
  setIsChatListUpdated: (updating: boolean) => void;
  setChatCountRate: (chat: ChatCount) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      isChatListUpdated: false,
      chatCountRate: [],

      setIsChatListUpdated: (value: boolean) =>
        set({ isChatListUpdated: value }),

      setChatCountRate: (chat: ChatCount) => {
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
      name: 'chat-storage', // unique storage key
      storage: createJSONStorage(() => zustandStorage), // same storage as useAdsStore
    },
  ),
);
