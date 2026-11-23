import { defineConfig, loadEnv } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const contentTarget = (
    env.VITE_API_URL_CONTENT_URL || "https://tdwstcontent.telkomsel.com"
  ).replace(/\/+$/, "");

  const proxy = {
    "/s3fs-public": {
      target: contentTarget,
      changeOrigin: true,
      secure: false,
    },
    "/minifnp": {
      target: contentTarget,
      changeOrigin: true,
      secure: false,
    },
    "/v2": {
      target: contentTarget,
      changeOrigin: true,
      secure: false,
    },
    "/api": {
      target: contentTarget,
      changeOrigin: true,
      secure: false,
    },
  };

  return {
    plugins: [tailwindcss(), viteSingleFile()],
    server: {
      proxy,
    },
    preview: {
      proxy,
    },
  };
});
