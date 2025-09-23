declare global {
  interface Window {
    rxdbUtils?: {
      closeDatabase: () => Promise<void>;
      resetDatabase: () => Promise<any>;
      clearIndexedDB: () => Promise<void>;
    };
  }
}

export {};