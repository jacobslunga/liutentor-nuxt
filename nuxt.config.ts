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
      // `viewport-fit=cover` is what makes env(safe-area-inset-*) resolve to
      // anything but 0 on notched iPhones — the mobile chat sheet needs it to
      // keep its collapsed bar off the home indicator.
      viewport:
        "width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content",
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
        { rel: "manifest", href: "/site.webmanifest" },
      ],
    },
  },

  routeRules: {
    "/": { prerender: true },

    "/om-oss": { prerender: true },
    "/faq": { prerender: true },
    "/ai-policy": { prerender: true },
    "/copyright-policy": { prerender: true },
    "/privacy-policy": { prerender: true },

    "/upload-exams": { prerender: true },
    "/feedback": { prerender: true },
  },

  // ─── Runtime Config ───────────────────────────────────────────
  runtimeConfig: {
    // Set via NUXT_REVALIDATE_SECRET. Shared with the Supabase webhook that
    // purges course caches when exams are published.
    revalidateSecret: "",
    resendApiKey: "",
    uploadNotificationTo: "jacobslunga21@yahoo.se",
    uploadNotificationFrom: "LiU Tentor <notifications@liutentor.se>",
    uploadReviewUrl: "https://admin.liutentor.se/admin/review",
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

    prerender: {
      // Emit `om-oss.html` rather than `om-oss/index.html`. With the subfolder
      // form, `/om-oss` 301s to `/om-oss/` before serving — an extra round trip
      // on every internal link, and on the sitemap entries, which list the
      // unslashed form. Netlify resolves the flat file for `/om-oss` directly.
      autoSubfolderIndex: false,
    },
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
