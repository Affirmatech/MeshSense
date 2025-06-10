export {};

declare global {
  interface Window {
    api?: {
      onOpenSettings?: (cb: () => void) => void;
      onFocusNodeFilter?: (cb: () => void) => void;
    };
  }
}
