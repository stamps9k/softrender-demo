import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["server.mts", "api/*", "src/libs/debug_config.mts"],
  format: ["esm"],
  platform: "node",
  bundle: false,
  outExtension() {
    return { js: ".mjs" };
  },
});
