/**
 * Web search is opt-in per student rather than always-on: each search carries a
 * per-call fee from the provider, and a tenta question almost never needs one.
 * The choice sticks in a cookie so it survives a reload, the same way the
 * thinking-level picker does.
 */
const WEB_SEARCH_COOKIE_KEY = "liutentor_web_search_v1";

export function useWebSearch() {
  const webSearch = useCookie<boolean>(WEB_SEARCH_COOKIE_KEY, {
    default: () => false,
    maxAge: 60 * 60 * 24 * 365,
  });

  function toggleWebSearch() {
    webSearch.value = !webSearch.value;
  }

  return { webSearch, toggleWebSearch };
}
