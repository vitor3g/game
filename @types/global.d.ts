import type { Core } from "@/client/core/core";

export {};

declare global {
  interface Window {
    g_core: Core;
  }

  const g_core: typeof window.g_core;
}
