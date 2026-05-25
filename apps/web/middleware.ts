import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware: refresh Supabase session on every request, then enforce
 * auth boundaries:
 *   - Authenticated routes (everything under `/dashboard`, `/onboarding`,
 *     `/agents`, `/conversations`, `/knowledge-base`, `/settings`) require
 *     a signed-in user — unauthenticated visitors get redirected to /auth/login.
 *   - Auth pages (under `/auth/*`) redirect signed-in users to `/dashboard`.
 */
export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  const isAuthRoute = pathname.startsWith("/auth");
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/agents") ||
    pathname.startsWith("/conversations") ||
    pathname.startsWith("/knowledge-base") ||
    pathname.startsWith("/settings");

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Skip Next internals, static files, favicon, fonts
    "/((?!_next/static|_next/image|favicon.ico|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};
