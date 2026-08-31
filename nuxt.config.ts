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

  app: {
    head: {
      titleTemplate: "LiU Tentor | %s",
      htmlAttrs: { lang: "sv" },
      charset: "utf-8",

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
          content: "#f8f8f8",
          media: "(prefers-color-scheme: light)",
        },
        {
          name: "theme-color",
          content: "#171918",
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

  runtimeConfig: {
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

  nitro: {
    preset: "netlify",
    compressPublicAssets: true,

    prerender: {

      autoSubfolderIndex: false,
    },
  },

  css: [
    "~/assets/css/tailwind.css",
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  imports: {
    autoImport: true,
  },

  devtools: { enabled: false },
});
