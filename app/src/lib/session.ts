import { headers } from "next/headers";
import { auth } from "@/app/src/lib/auth";

export async function getServerSession() {
  const requestHeaders = await headers();
  return auth.api.getSession({
    headers: requestHeaders,
  });
}
