import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: [
    "/api/public", 
    "/api/webhook/clerk", 
    "/api/test-db",
    "/api/local-files"
  ],
  afterAuth(auth, req, evt) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return Response.redirect(signInUrl);
    }
    
    // Redirect signed in users from sign-in/up pages to dashboard
    if (auth.userId && ['/sign-in', '/sign-up'].includes(new URL(req.url).pathname)) {
      const dashboard = new URL('/dashboard', req.url);
      return Response.redirect(dashboard);
    }
  }
});
 
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
