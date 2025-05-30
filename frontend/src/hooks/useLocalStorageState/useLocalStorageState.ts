import { useSyncExternalStore, useCallback, useRef } from "react";

const useLocalStorageState = () => {
  const snapshotCache = useRef<Array<string>>([]);

  const getSnapshot = useCallback(() => {
    // cannot use Object.keys() if we monkeypatch localStorage
    const keys = Array.from(
      { length: window.localStorage.length },
      (_, i) => window.localStorage.key(i) as string,
    );

    if (JSON.stringify(keys) !== JSON.stringify(snapshotCache.current)) {
      snapshotCache.current = keys;
    }

    return snapshotCache.current;
  }, []);

  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);

    return () => {
      window.removeEventListener("storage", callback);
    };
  }, []);

  const keys = useSyncExternalStore(subscribe, getSnapshot);

  // Patch methods so localStorage mutations trigger StorageEvent on current tab
  // - not needed since we are using util methods instead of touching localStorage
  //   directly, but keeping for reference.

  // if (typeof window !== "undefined") {
  //   const _setItem = window.localStorage.setItem;
  //   window.localStorage.setItem = function setItem(key, newValue) {
  //     const result = _setItem.call(this, key, newValue);
  //     window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
  //     return result;
  //   };
  //
  //   const _removeItem = window.localStorage.removeItem;
  //   window.localStorage.removeItem = function removeItem(key) {
  //     const result = _removeItem.call(this, key);
  //     return result;
  //   };
  // }

  return keys;
};

export default useLocalStorageState;
