import type { Core } from "@/client/core/Core";
import * as AmmoGlobal from "ammojs-typed";

export {};

declare global {
  interface Window {
    g_core: Core;
    Ammo: typeof AmmoGlobal.default;
  }

  const g_core: typeof window.g_core;
  const Ammo: typeof window.Ammo;
}
