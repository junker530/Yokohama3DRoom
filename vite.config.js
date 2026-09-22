import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/my-3d-room-ar/",
  plugins: [react()],
});
