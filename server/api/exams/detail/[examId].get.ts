export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "no-cache, no-store, must-revalidate");
  const examId = getRouterParam(event, "examId");

  const data = await $fetch(
    `https://liutentor-go-687405545415.europe-west1.run.app/v1/exams/${examId}`,
  );

  return data;
});
