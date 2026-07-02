import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/mlm/",
  server:{port:3004,},
  plugins: [react(), tailwindcss()],
});

