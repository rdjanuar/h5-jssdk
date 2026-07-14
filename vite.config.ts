import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), viteSingleFile()],
  server: {
    proxy: {
      "/s3fs-public": {
        target: "https://tdwstcontent.telkomsel.com",
        changeOrigin: true,
      },
    },
  },
});
