// store/categoryStore.ts
import { create } from 'zustand';
import { createPersistZustand, zustandStorage } from './store';
import { createJSONStorage, persist } from 'zustand/middleware';

type Theme = 'girlfriend' | 'boyfriend';
type Gender = 'male' | 'female';

export type Subcategory = {
  id: number;
  label: string | null;
  image: string | null;
  audio: string | null;
  isEmpty?: boolean;
  isSelected?: boolean;
  category_label?: string | null;
};

export type GenderCategory = {
  id: number;
  code: string | null;
  label: string | null;
  categories: AvatarCategory[];
  sub_categories: Subcategory[];
};

export type AvatarCategory = {
  id: number;
  image: string | null;
  input_type: string | null;
  is_required: boolean;
  label: string | null;
  sort_order: number;
  sub_categories: Subcategory[];
};

export interface AvatarItem {
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
  categories: AvatarCategory[];
  setCategories: (categories: AvatarCategory[]) => void;
  personaId: number;
  setPersonaId: (personaId: number) => void;
  selectedSubcategories: selectedSubcategoriesType;
  setSelectedSubcategories: (categoryId: string, subcategory: any) => void;
  clearCategories: () => void;

  fetchCategory: GenderCategory[];
  setFetchCategory: (fetchCategory: GenderCategory[]) => void;

  currentCategoryIndex: { [categoryId: string]: number };
  setCurrentCategoryIndex: (categoryId: string, index: number) => void;

  currentIndex: number;
  setCurrentIndex: (currentIndex: number) => void;

  summeryList: Subcategory[];
  setSummeryList: (list: Subcategory[]) => void;

  normalizeList: AvatarCategory[];
  setNormalizeList: (normalizeList: AvatarCategory[]) => void;

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
      setSelectedSubcategories: (categoryId, subcategory) => {
        const current = get().selectedSubcategories;
        const isAlreadySelected = current[categoryId]?.id === subcategory.id;

        const updated = { ...current };
        if (isAlreadySelected) {
          delete updated[categoryId];
        } else {
          updated[categoryId] = subcategory;
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
      setSummeryList: (list: Subcategory[]) => set({ summeryList: list }),
      setNormalizeList: (normalizeList: AvatarCategory[] | []) => {
        set({ normalizeList: normalizeList });
      },
      setAvatarErrMessage: (message: string) => {
        set({ avatarErrMessage: message });
      },
    }),
    {
      name: 'category-storage',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
