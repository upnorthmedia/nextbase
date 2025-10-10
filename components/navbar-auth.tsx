import { createClient } from '@/lib/supabase/server'
import { NavbarClient } from './navbar-client'

export async function NavbarAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <NavbarClient user={user} />
}