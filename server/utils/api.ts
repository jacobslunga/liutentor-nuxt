/**
 * The Go exam service. Overridable so local development can point at a
 * `go run ./cmd/api` instance instead of Cloud Run.
 */
export const GO_API_URL =
  process.env.NUXT_GO_API_URL ??
  "https://liutentor-go-687405545415.europe-west1.run.app";
