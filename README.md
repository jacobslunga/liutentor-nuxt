<div align="center">
  <img src="public/images/logo-light.svg" alt="LiU Tentor Logo" width="80" height="80">

# LiU Tentor

Browse and study past exams from Linköping University.

</div>

---

## Stack

- **Nuxt 4** + TypeScript
- **Tailwind CSS** + shadcn-vue
- **EmbedPDF** for PDF rendering
- **Supabase** for storage and database
- **Go API** — [jacobslunga/liutentor-go-api](https://github.com/jacobslunga/liutentor-go-api)

## Getting started

```bash
npm install
npm run dev
```

Add a `.env` file: <br />
`NUXT_PUBLIC_SUPABASE_URL`=<SUPABASE_URL> <br />
`NUXT_PUBLIC_SUPABASE_KEY`=<SUPABASE_ANON_KEY>

## Contributing

Branch naming: `feature/`, `fix/`, `chore/`, `docs/`

Keep commits short and descriptive — `feat(search): add course autocomplete`.
Open a PR against `main`, describe what changed and why, add screenshots for UI changes.

## Contact

Questions? Open an issue or email [liutentor@gmail.com](mailto:liutentor@gmail.com)
