export function useAuthHeaders() {
  const supabase = useSupabaseClient();

  async function getAuthHeaders(): Promise<Record<string, string>> {
    const { data } = await supabase.auth.getSession();
    return data.session
      ? { Authorization: `Bearer ${data.session.access_token}` }
      : {};
  }

  return { getAuthHeaders };
}
