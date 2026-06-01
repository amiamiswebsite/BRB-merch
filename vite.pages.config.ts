import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/BRB-merch/",
  root: "pages",
  publicDir: "public",
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: "../dist/pages",
    emptyOutDir: true,
  },
});
