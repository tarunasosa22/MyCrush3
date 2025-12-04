// store/categoryStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from './store';

type Theme = 'girlfriend' | 'boyfriend';
type Gender = 'male' | 'female';

export type SubcategoryTypes = {
  id: number;
  label: string | null;
  image: string | null;
  audio: string | null;
  isEmpty?: boolean;
  isSelected?: boolean;
  category_label?: string | null;
};

export type GenderCategoryTypes = {
  id: number;
  code: string | null;
  label: string | null;
  categories: AvatarCategoryTypes[];
  sub_categories: SubcategoryTypes[];
};

export type AvatarCategoryTypes = {
  id: number;
  image: string | null;
  input_type: string | null;
  is_required: boolean;
  label: string | null;
  sort_order: number;
  sub_categories: SubcategoryTypes[];
};

export interface AvatarItemTypes {
  id: number | string;
  name?: string;
  image?: string;
  cover_image?: string;
  age?: number;
  tag?: string;
  isLike?: boolean;
  persona_type?: string;
  isEmpty?: boolean;
  chat?: {
    chat_id: number | string;
  };
  categories?: Array<{
    label: string;
    options: Array<{
      label: string;
    }>;
  }>;
}

type selectedSubcategoriesType = {
  [categoryId: string]: {
    id: number;
    label: string;
    image: string | null;
    audio: any;
  };
};

type CategoryStore = {
  categories: AvatarCategoryTypes[];
  setCategories: (categories: AvatarCategoryTypes[]) => void;
  personaId: number | string;
  setPersonaId: (personaId: number | string) => void;
  selectedSubcategories: selectedSubcategoriesType;
  setSelectedSubcategories: (categoryId: string, subcategoryTypes: any) => void;
  clearCategories: () => void;

  fetchCategory: GenderCategoryTypes[];
  setFetchCategory: (fetchCategory: GenderCategoryTypes[] | []) => void;

  currentCategoryIndex: { [categoryId: string]: number };
  setCurrentCategoryIndex: (categoryId: string, index: number) => void;

  currentIndex: number;
  setCurrentIndex: (currentIndex: number) => void;

  summeryList: SubcategoryTypes[];
  setSummeryList: (list: SubcategoryTypes[]) => void;

  normalizeList: AvatarCategoryTypes[];
  setNormalizeList: (normalizeList: AvatarCategoryTypes[]) => void;

  avatarErrMessage: string;
  setAvatarErrMessage: (message: string) => void;

  avatarName: string;
  setAvatarName: (avatarName: string) => void;
};

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      fetchCategory: [],
      categories: [],
      personaId: 0,
      currentIndex: 0,
      currentCategoryIndex: {},
      normalizeList: [],
      summeryList: [], // ✅ initial state for summary list
      avatarErrMessage: '',
      avatarName: '',
      setAvatarName: (avatarName: string) => set({ avatarName: avatarName }),

      setCategories: categories => set({ categories }),

      selectedSubcategories: {},
      setSelectedSubcategories: (categoryId, subcategoryTypes) => {
        const current = get().selectedSubcategories;
        const isAlreadySelected =
          current[categoryId]?.id === subcategoryTypes.id;

        const updated = { ...current };
        if (isAlreadySelected) {
          delete updated[categoryId];
        } else {
          updated[categoryId] = subcategoryTypes;
        }

        set({ selectedSubcategories: updated });
      },

      clearCategories: () => set({ categories: [] }),

      setFetchCategory: fetchCategory => set({ fetchCategory }),

      setPersonaId: personaId => set({ personaId }),

      setCurrentCategoryIndex: (categoryId, index) => {
        const current = get().currentCategoryIndex;
        set({ currentCategoryIndex: { ...current, [categoryId]: index } });
      },
      setCurrentIndex: (index: number) => {
        set({ currentIndex: index });
      },

      // ✅ add setter for summeryList
      setSummeryList: (list: SubcategoryTypes[]) => set({ summeryList: list }),
      setNormalizeList: (normalizeList: AvatarCategoryTypes[] | []) => {
        set({ normalizeList: normalizeList });
      },
      setAvatarErrMessage: (message: string) => {
        set({ avatarErrMessage: message });
      },
    }),
    {
      name: 'category-list-storage',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
