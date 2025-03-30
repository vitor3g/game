import { ImGui } from "@zhobo63/imgui-ts";

/**
 * Converts a hex string (#RRGGBB or #RGB) to ImVec4 with alpha set to 1.0
 */
export function hexToImVec4(hex: string): ImGui.ImVec4 {
  const sanitized = hex.replace(/^#/, "");

  let r: number, g: number, b: number;

  if (sanitized.length === 3) {
    r = parseInt(sanitized[0] + sanitized[0], 16);
    g = parseInt(sanitized[1] + sanitized[1], 16);
    b = parseInt(sanitized[2] + sanitized[2], 16);
  } else if (sanitized.length === 6) {
    r = parseInt(sanitized.substring(0, 2), 16);
    g = parseInt(sanitized.substring(2, 4), 16);
    b = parseInt(sanitized.substring(4, 6), 16);
  } else {
    g_core.getLogger().error('Invalid hex color format. Use #RRGGBB or #RGB.');
    throw new Error()
  }

  return new ImGui.ImVec4(r / 255, g / 255, b / 255, 1.0);
}

/**
 * Converts RGBA values (0–255) to ImVec4
 */
export function rgbaToImVec4(r: number, g: number, b: number, a = 255): ImGui.ImVec4 {
  return new ImGui.ImVec4(r / 255, g / 255, b / 255, a / 255);
}

/**
 * Clamps a number between a minimum and a maximum value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Checks if two numbers are approximately equal within a given epsilon
 */
export function approximately(a: number, b: number, epsilon = 0.001): boolean {
  return Math.abs(a - b) < epsilon;
}
