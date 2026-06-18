import type { SupabaseClient } from '@supabase/supabase-js'

export async function isAdminUser(supabase: SupabaseClient, userId: string | null) {
  const status = await getAdminStatus(supabase, userId)
  return status.isAdmin
}

export async function getAdminStatus(supabase: SupabaseClient, userId: string | null) {
  if (!userId) {
    return {
      isAdmin: false,
      error: '',
    }
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    return {
      isAdmin: false,
      error: error.message,
    }
  }

  return {
    isAdmin: Boolean(data),
    error: '',
  }
}
