import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin tự động tạo version mới cho mỗi lần commit & build
function autoVersionPlugin() {
  const buildTime = Date.now().toString();
  return {
    name: "auto-version-plugin",
    buildStart() {
      // Cập nhật version.json
      const versionFile = path.resolve(__dirname, "public", "version.json");
      fs.writeFileSync(
        versionFile,
        JSON.stringify(
          {
            buildTime,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        ),
        "utf-8"
      );
    },
    closeBundle() {
      // Đảm bảo file dist/sw.js luôn có nội dung mới để trình duyệt nhận diện được sự thay đổi
      const distSw = path.resolve(__dirname, "dist", "sw.js");
      if (fs.existsSync(distSw)) {
        let content = fs.readFileSync(distSw, "utf-8");
        content = `// Auto Build Version: ${buildTime}\n` + content;
        fs.writeFileSync(distSw, content, "utf-8");
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [autoVersionPlugin(), react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
