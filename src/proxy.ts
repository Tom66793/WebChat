import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Route protection is handled client-side via AuthContext.
  // This middleware can be extended for server-side token verification.
  return NextResponse.next();
}

export const config = {
  matcher: ['/chat/:path*'],
};
