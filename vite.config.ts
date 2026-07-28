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
        secure: false,
      },
      "/minifnp": {
        target: "https://tdwcontent.telkomsel.com",
        changeOrigin: true,
        secure: false,
      },
      "/v2": {
        target: "https://tdwstcontent.telkomsel.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
