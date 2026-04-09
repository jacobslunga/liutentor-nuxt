export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const supabase = useSupabase();

  const { error } = await supabase.from("feedback").insert([
    {
      name: body.name,
      message: body.message,
      part_of_website: body.part_of_website,
      liu_mail: body.liu_mail,
    },
  ]);

  if (error) throw createError({ statusCode: 500, message: error.message });

  return { success: true };
});
