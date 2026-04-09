export default defineEventHandler(async (event) => {
  const examId = getRouterParam(event, "examId");

  const data = await $fetch(
    `https://liutentor-go-api-production.up.railway.app/v1/exams/${examId}`,
  );

  return data;
});
