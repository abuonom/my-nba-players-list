import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@supabase/supabase-js'
import { createServerClient as createSSRClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ADMIN_USER_ID = '0a4acf29-3841-43ce-bfcf-e4047d1f8c59'

async function getCallerUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const supabase = createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

function adminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const callerId = await getCallerUserId()
  if (callerId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { data, error } = await adminClient().auth.admin.listUsers()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const users = data.users.map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    email_confirmed_at: u.email_confirmed_at,
  }))

  return NextResponse.json({ users })
}

export async function DELETE(request: NextRequest) {
  const callerId = await getCallerUserId()
  if (callerId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { userId } = await request.json()
  if (!userId || userId === ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Invalid user' }, { status: 400 })
  }

  const { error } = await adminClient().auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
