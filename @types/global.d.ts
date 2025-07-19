import type { Core } from '@/client/core/Core';
import * as AmmoGlobal from 'ammojs-typed';

export {};

declare global {
  interface Window {
    g_core: Core;
    Ammo: typeof AmmoGlobal.default;
    DRIFTZONE_DEBUG: boolean
  }

  const g_core: typeof window.g_core;
  const Ammo: typeof window.Ammo;

  const DRIFTZONE_DEBUG: window.DRIFTZONE_DEBUG; 
}
