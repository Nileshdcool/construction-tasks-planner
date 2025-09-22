// Global type declarations for development utilities

declare global {
  interface Window {
    rxdbUtils?: {
      closeDatabase: () => Promise<void>;
      resetDatabase: () => Promise<any>;
      clearIndexedDB: () => Promise<void>;
    };
  }
}

export {}; // Make this a module