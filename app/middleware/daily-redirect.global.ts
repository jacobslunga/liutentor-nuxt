/**
 * `?showDaily=1` was the original way into the puzzle, and links to it are
 * already out in the world. Send them to the real page.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== "/" || to.query.showDaily !== "1") return;

  const query = { ...to.query };
  delete query.showDaily;

  return navigateTo({ path: "/dagens-kurskod", query }, { redirectCode: 302 });
});
