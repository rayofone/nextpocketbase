import PocketBase from "pocketbase";

const url = process.env.NEXT_PUBLIC_POCKETBASE_URL;

if (!url) {
  console.warn(
    "NEXT_PUBLIC_POCKETBASE_URL is not set. Copy .env.example to .env.local and set your PocketBase URL.",
  );
}

/** Browser-safe PocketBase client. Reuses one instance per page load. */
function createClient() {
  return new PocketBase(url ?? "http://127.0.0.1:8090");
}

let browserClient: PocketBase | undefined;

export function getPocketBase() {
  if (typeof window === "undefined") {
    return createClient();
  }

  if (!browserClient) {
    browserClient = createClient();
  }

  return browserClient;
}

export const COLLECTION =
  process.env.NEXT_PUBLIC_POCKETBASE_COLLECTION ?? "items";

/** Auth collection used for email/password sign-in (PocketBase default: users). */
export const AUTH_COLLECTION =
  process.env.NEXT_PUBLIC_POCKETBASE_AUTH_COLLECTION ?? "users";
