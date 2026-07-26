import { auth } from "./auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const role = req.auth?.user?.role // "USER" or "ADMIN"

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const isPortalRoute = nextUrl.pathname.startsWith("/portal")
  const isAuthRoute = nextUrl.pathname.startsWith("/sign-in") || nextUrl.pathname.startsWith("/sign-up")

  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  // Admins live entirely in the admin console; everyone else lives in the donor portal.
  const homeFor = (r?: string) => (r === "ADMIN" ? "/admin/extract" : "/portal")

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(homeFor(role), nextUrl))
    }
    return NextResponse.next()
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/sign-in?redirect=${nextUrl.pathname}`, nextUrl))
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/portal", nextUrl))
    }
    return NextResponse.next()
  }

  if (isPortalRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/sign-in?redirect=${nextUrl.pathname}`, nextUrl))
    }
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/extract", nextUrl))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
