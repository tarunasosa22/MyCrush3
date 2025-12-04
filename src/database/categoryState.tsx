import { createPersistZustand } from '../store/store';

export type UpdatedCategory = {
  id: number;
  name: string;
  image_url: string;
  empty?: boolean;
  order?: 3;
};

export type UpdatedAvatarType = {
  category_id: number;
  id: number;
  image_url: string;
  name: string;
  order: null | number;
  text: string;
  gender: 'male' | 'female';
  is_local?: boolean;
  text_audio_file: {
    type: string;
    uri: string;
    name: string;
  };
  isCustomImage?: boolean;
};

export type UpdatedExploreVideoType = {
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
  job_id?: number;
  is_video_like?: boolean;
  like_count?: number;
  share_count?: number;
  view_count?: number;
  download_count?: number;
};

export type UpdatedAIAvatarsType = {
  avatars: UpdatedAvatarType[];
  category_id: number;
  category_name: string;
};

export type UpdatedExploreType = {
  videos: UpdatedExploreVideoType[];
  category_id: number;
};

type UpdatedCategoriesState = {
  allCategories: UpdatedCategory[];
  setCategories: (categories: UpdatedCategory[]) => void;
  AIAvatars: UpdatedAIAvatarsType[];
  setAIAvatars: (avatars: UpdatedAIAvatarsType[]) => void;

  explores: UpdatedExploreType[];
  setExplores: (explores: UpdatedExploreType[]) => void;

  allExploreCategories: UpdatedCategory[];
  setAllExploreCategories: (categories: UpdatedCategory[]) => void;

  selectedCategoryReels: UpdatedExploreType | undefined;
  setSelectedCategoryReels: (
    selectedCategoryReels: UpdatedExploreType | undefined,
  ) => void;
  isNavigateToExplore: boolean;
  setIsNavigateToExplore: (isNavigateToExplore: boolean) => void;
  resetExplores: () => void;
  resetAvtars: () => void;
};

export const categoriesState = createPersistZustand<UpdatedCategoriesState>(
  'categories',
  (set, get) => ({
    allCategories: [],
    AIAvatars: [],
    explores: [],
    allExploreCategories: [],
    selectedCategoryReels: undefined,
    isNavigateToExplore: false,
    setCategories: categories => {
      set({ ...get(), allCategories: categories });
    },
    setAIAvatars: avatars => {
      set({ ...get(), AIAvatars: avatars });
    },
    setAllExploreCategories: categories => {
      set({ ...get(), allExploreCategories: categories });
    },
    setExplores: explores => {
      set({ ...get(), explores });
    },
    setSelectedCategoryReels: selectedCategoryReels => {
      set({ ...get(), selectedCategoryReels: selectedCategoryReels });
    },
    setIsNavigateToExplore: (isNavigateToExplore: boolean) => {
      set({ ...get(), isNavigateToExplore: isNavigateToExplore });
    },
    resetExplores: () => {
      set({
        ...get(),
        allExploreCategories: [],
        explores: [],
        selectedCategoryReels: undefined,
      });
    },
    resetAvtars: () => {
      set({
        ...get(),
        allCategories: [],
        AIAvatars: [],
      });
    },
  }),
);
