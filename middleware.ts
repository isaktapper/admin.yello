import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get user session
  const { data: { user } } = await supabase.auth.getUser()

  // Handle login page
  if (request.nextUrl.pathname === '/login') {
    if (user) {
      // User is logged in, check if they're admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('admin')
        .eq('id', user.id)
        .single()

      if (profile?.admin) {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
    return response
  }

  // Handle unauthorized page
  if (request.nextUrl.pathname === '/unauthorized') {
    return response
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if user has admin privileges
    const { data: profile } = await supabase
      .from('profiles')
      .select('admin')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.admin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // Redirect root to admin for authenticated admin users
  if (request.nextUrl.pathname === '/') {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('admin')
        .eq('id', user.id)
        .single()

      if (profile?.admin) {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
} 