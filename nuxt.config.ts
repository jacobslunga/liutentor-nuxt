import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  modules: [
    "@nuxtjs/supabase",
    "@nuxtjs/color-mode",
    "@pinia/nuxt",
    "shadcn-nuxt",
    "nuxt-lucide-icons",
    "nuxt-gtag",
    "nuxt-shiki",
  ],

  // ─── App & Meta ───────────────────────────────────────────────
  app: {
    head: {
      titleTemplate: "LiU Tentor | %s",
      htmlAttrs: { lang: "sv" },
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      meta: [
        {
          name: "description",
          content:
            "Hitta och plugga på gamla tentor från Linköpings Universitet",
        },
        { name: "robots", content: "index, follow" },
        { name: "format-detection", content: "telephone=no" },
        {
          name: "theme-color",
          content: "#ffffff",
          media: "(prefers-color-scheme: light)",
        },
        {
          name: "theme-color",
          content: "#181818",
          media: "(prefers-color-scheme: dark)",
        },
        { property: "og:site_name", content: "LiU Tentor" },
        { property: "og:type", content: "website" },
        {
          property: "og:title",
          content: "LiU Tentor - Gamla tentor från Linköpings Universitet",
        },
        {
          property: "og:description",
          content:
            "Hitta och plugga på gamla tentor från Linköpings Universitet",
        },
        { property: "og:locale", content: "sv_SE" },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:title",
          content: "LiU Tentor - Gamla tentor från Linköpings Universitet",
        },
        {
          name: "twitter:description",
          content:
            "Hitta och plugga på gamla tentor från Linköpings Universitet",
        },
      ],
      link: [
        // The tab icon is registered in app.vue so it can follow the active
        // colour mode. Declaring it here as well would leave two competing
        // <link rel="icon"> tags in the document.
        { rel: "manifest", href: "/site.webmanifest" },
        {
          rel: "preload",
          as: "font",
          type: "font/woff2",
          href: "/fonts/GitLabSansVF.woff2",
          crossorigin: "anonymous",
        },
      ],
    },
  },

  // ─── Route Rules & Caching ─────────────────────────────────────
  routeRules: {
    "/om-oss": { prerender: true },
    "/faq": { prerender: true },
    "/ai-policy": { prerender: true },
    "/copyright-policy": { prerender: true },
    "/privacy-policy": { prerender: true },
  },

  // ─── Runtime Config ───────────────────────────────────────────
  runtimeConfig: {
    // Set via NUXT_REVALIDATE_SECRET. Shared with the Supabase webhook that
    // purges course caches when exams are published.
    revalidateSecret: "",
    public: {
      supabaseUrl: "",
      supabaseKey: "",
      siteUrl: "https://liutentor.se",
    },
  },

  // ─── Module Config ────────────────────────────────────────────
  supabase: {
    redirect: false,
  },

  colorMode: {
    classSuffix: "",
    storageKey: "color-mode",
  },

  shadcn: {
    prefix: "",
    componentDir: "./app/components/ui",
  },

  shiki: {
    bundledThemes: ["one-light", "one-dark-pro"],
    bundledLangs: [
      "typescript",
      "javascript",
      "python",
      "java",
      "c",
      "cpp",
      "csharp",
      "html",
      "css",
      "json",
      "sql",
      "bash",
    ],
    defaultTheme: "one-light",
  },

  gtag: {
    enabled: process.env.NODE_ENV === "production",
  },

  // ─── Build & Infra ────────────────────────────────────────────
  nitro: {
    preset: "netlify",
    compressPublicAssets: true,
  },

  css: ["~/assets/css/tailwind.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  imports: {
    autoImport: true,
  },

  devtools: { enabled: false },
});
