import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type PersistZustandSetter<T> = (props: T) => void;
export type PersistZustandGetter<T> = () => T;

export type PersistZustandFunction<T> = (
  set: PersistZustandSetter<T>,
  get: PersistZustandGetter<T>,
) => T;

export const mmkv = new MMKV();

export const configureStorage = <T>(id: string) => {
  const mmkv = new MMKV({ id });

  return {
    name: id,
    storage: createJSONStorage<T>(() => ({
      getItem: (key: string) => mmkv.getString(key) ?? '',
      setItem: (key: string, value: string) => mmkv.set(key, value),
      removeItem: (key: string) => mmkv.delete(key),
    })),
  };
};


 


export const createPersistZustand = <T>(
  name: string,
  createStore: PersistZustandFunction<T>,
) => create(persist<T>(createStore, configureStorage<T>(name)));

export const zustandStorage = {
  getItem: (key: string): string | null => {
    return mmkv.getString(key) ?? null;
  },
  setItem: (key: string, value: string) => {
    return mmkv.set(key, value);
  },
  removeItem: (key: string) => {
    return mmkv.delete(key);
  },
};
