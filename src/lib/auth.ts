/**
 * Check if Clerk authentication is configured.
 * When false, all auth components gracefully render nothing or fallback content.
 */
export const hasClerkAuth = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
