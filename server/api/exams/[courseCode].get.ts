export default defineEventHandler(async (e) => {
  const courseCode = getRouterParam(e, "courseCode");

  try {
    const data = await $fetch(
      `https://liutentor-go-api-production.up.railway.app/v1/exams/LIU/${courseCode}`,
    );
    return data;
  } catch (err: any) {
    if (err?.status === 404) {
      return { data: null };
    }
    throw err;
  }
});
