export default defineEventHandler(async (e) => {
  const courseCode = getRouterParam(e, "courseCode");

  const data = await $fetch(
    `https://liutentor-go-api-production.up.railway.app/v1/exams/LIU/${courseCode}`,
  );

  return data;
});
