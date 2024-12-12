import { webxdcViteConfig } from "@webxdc/vite-plugins";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(
  webxdcViteConfig({
    plugins: [react()],
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
        },
      },
    },
  }),
);
