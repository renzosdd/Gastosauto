import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function useLocalStorageState<T>(
  key: string,
  initialValue: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const storedValue = window.localStorage.getItem(key);

    if (storedValue) {
      try {
        return JSON.parse(storedValue) as T;
      } catch (error) {
        console.warn('No se pudo leer el estado guardado en localStorage.', error);
      }
    }

    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}
