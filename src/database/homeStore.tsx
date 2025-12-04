import { createPersistZustand } from '../store/store';

export type AvatarType = {
  category_id: number;
  category_name: string;
  avatars: [];
  isBottomHide: boolean;
};

export type ExploreVideoType = {
  audio_url: string;
  category_id: number;
  category_name: string;
  description: string;
  id: number;
  image_url: string;
  order: number;
  text: string;
  title: string;
  video_url: string;
};

export type ExploreType = {
  category_id: number;
  videos: ExploreVideoType[];
};

type HomeType = {
  setAvatarsBySelectedCategories: (
    avatarsBySelectedCategories: AvatarType[],
  ) => void;
  setExploresBySelectedCategories: (
    exploresBySelectedCategories: ExploreType[] | undefined,
  ) => void;
  avatarsBySelectedCategories: AvatarType[];
  exploresBySelectedCategories: ExploreType[];
  resetAvatarsBySelectedCategories: () => void;
  resetExploresBySelectedCategories: () => void;
  isBottomHide: boolean;
  setIsBottomHide: (isBottomHide: boolean) => void;
  isOpenStoryScreen: boolean;
  setIsOpenStoryScreen: (isOpenStoryScreen: boolean) => void;
};

export const homeStore = createPersistZustand<HomeType>('home', (set, get) => ({
  avatarsBySelectedCategories: [],
  exploresBySelectedCategories: [],
  isBottomHide: false,
  isOpenStoryScreen: false,
  setAvatarsBySelectedCategories: newAvatars => {
    const currentAvatars = Array.isArray(get().avatarsBySelectedCategories)
      ? get().avatarsBySelectedCategories
      : [];

    // Convert single object into array if needed
    const newAvatarsSafe = Array.isArray(newAvatars)
      ? newAvatars
      : [newAvatars];

    set({
      ...get(),
      avatarsBySelectedCategories: [...currentAvatars, ...newAvatarsSafe],
    });
  },
  setExploresBySelectedCategories: newExplores => {
    const currentExplores = Array.isArray(get().exploresBySelectedCategories)
      ? get().exploresBySelectedCategories
      : [];

    // Convert single object into array if needed
    const newExploresSafe = Array.isArray(newExplores)
      ? newExplores
      : [newExplores];

    set({
      ...get(),
      exploresBySelectedCategories: [
        ...currentExplores,
        ...(newExploresSafe?.filter(
          (explore): explore is ExploreType => explore !== undefined,
        ) ?? []),
      ],
    });
  },

  resetAvatarsBySelectedCategories: () => {
    set({
      ...get(),
      avatarsBySelectedCategories: [],
    });
  },
  resetExploresBySelectedCategories: () => {
    set({
      ...get(),
      exploresBySelectedCategories: [],
    });
  },
  setIsBottomHide: (isBottomHide: boolean) => {
    set({
      ...get(),
      isBottomHide: isBottomHide,
    });
  },
  setIsOpenStoryScreen: (isOpenStoryScreen: boolean) => {
    set({
      ...get(),
      isOpenStoryScreen: isOpenStoryScreen,
    });
  },
}));
