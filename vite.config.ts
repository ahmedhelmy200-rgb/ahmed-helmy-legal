import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const isDev = mode === "development";

  return {
    // GitHub Pages repository path:
    // https://ahmedhelmy200-rgb.github.io/ahmed-helmy-legal/
    base: "/ahmed-helmy-legal/",

    server: {
      port: 3000,
      host: "0.0.0.0",
    },

    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: false,
        includeAssets: ["favicon.ico", "apple-touch-icon.png", "portal-icon.svg"],
        manifest: {
          name: "المستشار أحمد حلمي | Ahmed Helmy Legal",
          short_name: "Ahmed Helmy Legal",
          description: "الموقع الرسمي المستقل للمستشار أحمد حلمي للخدمات والاستشارات القانونية.",
          theme_color: env.VITE_THEME_COLOR || "#111827",
          background_color: "#020617",
          display: "standalone",
          orientation: "portrait-primary",
          scope: "/ahmed-helmy-legal/",
          start_url: "/ahmed-helmy-legal/",
          icons: [
            {
              src: "/ahmed-helmy-legal/icons/icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/ahmed-helmy-legal/icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "/ahmed-helmy-legal/icons/icon-512-maskable.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          navigateFallback: "/ahmed-helmy-legal/index.html",
          globPatterns: isDev ? [] : ["**/*.{js,css,html,ico,png,svg,woff2}", "assets/**/*"],
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.includes("/rest/v1/") || url.hostname.includes("supabase"),
              handler: "NetworkOnly",
            },
            {
              urlPattern: ({ request }) => request.destination === "image",
              handler: "CacheFirst",
              options: {
                cacheName: "images",
                expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              urlPattern: ({ request }) => request.destination === "font",
              handler: "CacheFirst",
              options: {
                cacheName: "fonts",
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],

    define: {},

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },

    build: {
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            charts: ["recharts"],
          },
        },
      },
    },
  };
});