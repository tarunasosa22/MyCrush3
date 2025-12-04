// src/store/useThemeStore.ts
import {create} from 'zustand';

interface LoaderState {
  loaderCount: number;
  showLoader: () => void;
  hideLoader: () => void;
  resetLoader: () => void;
}

export const useLoaderStore = create<LoaderState>()((set, get) => ({
  loaderCount: 0,
  showLoader: () => set({loaderCount: get().loaderCount + 1}),
  hideLoader: () => set({loaderCount: Math.max(0, get().loaderCount - 1)}),
  resetLoader: () => set({loaderCount: 0}),
}));
