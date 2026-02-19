import tailwindcss from "@tailwindcss/vite";
import type { PluginOption } from "vite";

export function tailwindVitePlugin(): PluginOption {
  return tailwindcss();
}