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
        // Body text is Google Sans Flex, so the latin subset is on the critical
        // path for every page. Preloading it starts the fetch alongside the
        // stylesheet instead of after it parses. latin-ext is left out — it only
        // covers characters this site rarely renders.
        {
          rel: "preload",
          as: "font",
          type: "font/woff2",
          href: "/fonts/google-sans-flex-latin-wght-normal.woff2",
          crossorigin: "anonymous",
        },
      ],
    },
  },

  // ─── Route Rules & Caching ─────────────────────────────────────
  //
  // Prerendered routes are emitted as static HTML at build time, so they are
  // served straight from the CDN and never invoke the server function. That
  // matters more than the per-request render cost: the function bundle is
  // ~22 MB, and a cold start costs ~4.5 s of TTFB.
  //
  // A route only belongs here if its rendered HTML is identical for every
  // visitor. Anything that reads the auth cookie during SSR must not be
  // prerendered *or* edge-cached — `layouts/auth.vue` and `layouts/profile.vue`
  // call `navigateTo()` from an immediate watcher, so their responses can be a
  // 302 whose target depends on who is asking. Caching one of those would pin
  // one visitor's redirect onto everyone else.
  routeRules: {
    // Landing page. Renders no server data: `AuthActions` and `RecentSearches`
    // are both behind `isMounted`, so the recent-searches cookie is read on the
    // client after hydration and never reaches the server-rendered markup.
    "/": { prerender: true },

    "/om-oss": { prerender: true },
    "/faq": { prerender: true },
    "/ai-policy": { prerender: true },
    "/copyright-policy": { prerender: true },
    "/privacy-policy": { prerender: true },

    // Static content under the `info` layout, same as the policy pages above.
    "/upload-exams": { prerender: true },
    "/feedback": { prerender: true },
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
