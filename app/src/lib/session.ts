import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/app/src/lib/auth";

// Cache the session per request so layout/page can reuse it without a second auth lookup.
export const getServerSession = cache(async function getServerSession() {
  const requestHeaders = await headers();
  return auth.api.getSession({
    headers: requestHeaders,
  });
});
