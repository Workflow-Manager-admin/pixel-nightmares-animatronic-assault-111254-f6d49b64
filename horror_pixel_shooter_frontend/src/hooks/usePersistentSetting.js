import { useCallback, useEffect, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * usePersistentSetting(key, defaultValue)
 * Persist small settings in localStorage.
 */
export function usePersistentSetting(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  const setter = useCallback((v) => {
    setValue(typeof v === 'function' ? v(value) : v);
  }, [value]);

  return [value, setter];
}
