let dbPromise: Promise<IDBDatabase> = new Promise(function (resolve, reject) {
  const request = window.indexedDB.open('a5', 1);
  request.onsuccess = function () {
    resolve(request.result);
  };
  request.onerror = function () {
    reject(request.error);
  };
  request.onupgradeneeded = function (event: IDBVersionChangeEvent) {
    const db = (event.target as IDBOpenDBRequest).result;
    if (!db.objectStoreNames.contains('state')) {
      db.createObjectStore('state');
    }
  }
});

export const IndexedDbService = {
  async getState<T>(key: string): Promise<T | null> {
    const db = await dbPromise;
    return new Promise(function (resolve, reject) {
      const transaction = db.transaction('state', 'readonly');
      const store = transaction.objectStore('state');
      const request = store.get(key);
      request.onsuccess = function () {
        resolve(request.result || null);
      };
      request.onerror = function () {
        reject(request.error);
      };
    });
  },

  async setState<T>(key: string, value: T): Promise<void> {
    const db = await dbPromise;
    return new Promise(function (resolve, reject) {
      const transaction = db.transaction('state', 'readwrite');
      const store = transaction.objectStore('state');
      const request = store.put(value, key);
      request.onsuccess = function () {
        resolve();
      };
      request.onerror = function () {
        reject(request.error);
      };
    });
   },
};
