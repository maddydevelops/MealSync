import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function proxy(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token; // JWT from next-auth

    // Redirect to login if not authenticated
    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    const role = token.role;

    // Redirect root "/" based on role
    // if (pathname === "/") {
    //   if (role === "superadmin") return NextResponse.redirect(new URL("/dashboard", req.url));
    //   if (role === "owner") return NextResponse.redirect(new URL("/owner/dashboard", req.url));
    // }

    // Superadmin route protection
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/users") || pathname.startsWith("/restaurants") || pathname.startsWith("/announcement") || pathname.startsWith("/payments") || pathname.startsWith("/subscriptions") || pathname.startsWith("/settings")) {
      if (role !== "superadmin") return NextResponse.redirect(new URL("/owner/dashboard", req.url));
    }

    // Owner route protection
    if (pathname.startsWith("/owner") && role !== "owner") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/users/:path*", "/restaurants/:path*", "/announcement/:path*", "/payments/:path*", "/subscriptions/:path*", "/settings/:path*", "/owner/:path*"],
};
