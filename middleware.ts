import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from 'next/server';
import { JWT } from "next-auth/jwt"; // Import JWT type

declare module "next/server" {
  interface NextRequest {
    nextauth?: {
      token: JWT | null;
    };
  }
}

export default withAuth(
  async function middleware(req: NextRequest) {
    const token = req.nextauth!.token;
    const pathname = req.nextUrl.pathname;

    // Allow access to auth pages without authentication
    if (pathname.startsWith("/auth/")) {
      return NextResponse.next();
    }

    // Redirect unauthenticated users to sign-in
    if (!token) {
      const url = new URL(`/auth/signin`, req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // Handle 2FA verification during login flow
    // If user has totpSecret and is not trying to verify 2FA, redirect to 2FA page
    if (token.totpRequired && !pathname.startsWith("/auth/verify-2fa")) {
      const url = new URL(`/auth/verify-2fa`, req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // For protected routes, check verification status
    if (pathname.startsWith("/dashboard") || 
        pathname.startsWith("/userdemo") || // Assuming demo creation is under /userdemo
        pathname.startsWith("/api/demo/create") || // Protect demo creation API
        pathname.startsWith("/api/dashboard/knowledge-bases")) { // Protect KB creation APIs
      if (!token.isVerified) {
        const url = new URL(`/auth/signin?error=Please verify your email to access this page.`, req.url);
        // Optionally, redirect to a dedicated unverified page if you create one.
        return NextResponse.redirect(url);
      }
    }

    // Admin specific protection (if needed, although roles are checked in API routes too)
    if (pathname.startsWith("/admin")) {
      if (token.role !== "ADMIN" && token.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL('/dashboard?error=Access Denied', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // This callback is for basic authorization checks by NextAuth.js itself.
        // The main logic is now handled in the custom middleware function above.
        // We return true here to let the custom middleware handle all redirects.
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/userdemo/:path*", // Protect user demo page
    "/api/demo/create", // Protect demo creation API
    "/api/dashboard/knowledge-bases/:path*", // Protect KB APIs
    "/auth/verify-2fa", // New 2FA verification page
  ]
};
