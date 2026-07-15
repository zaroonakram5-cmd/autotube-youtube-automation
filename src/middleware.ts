import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Authentication disabled - all routes are public
// Uncomment below to re-enable authentication

// const protectedRoutes = [
//   '/dashboard',
//   '/video-editor',
//   '/content-library',
//   '/scheduler',
//   '/analytics',
//   '/settings',
//   '/admin',
// ]

export function middleware(request: NextRequest) {
  // Allow all routes without authentication
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}
