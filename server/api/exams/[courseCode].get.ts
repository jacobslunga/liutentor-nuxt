export default defineEventHandler(async (e) => {
  const courseCode = getRouterParam(e, "courseCode");

  try {
    const data = await $fetch(
      `https://liutentor-go-687405545415.europe-west1.run.app/v1/exams/LIU/${courseCode}`,
    );
    return data;
  } catch (err: any) {
    if (err?.status === 404) {
      return { data: null };
    }
    throw err;
  }
});
