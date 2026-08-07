import { ClientResponseError } from "pocketbase";

export function errorMessage(err: unknown, fallback = "Unexpected error"): string {
  if (err instanceof ClientResponseError) {
    if (err.status === 0) {
      return "Could not reach PocketBase. Check the URL, that the service is running, and CORS settings.";
    }

    const data = err.response?.data as
      | Record<string, { message?: string } | undefined>
      | undefined;
    if (data) {
      const fieldMessage = Object.values(data)
        .map((entry) => entry?.message)
        .find(Boolean);
      if (fieldMessage) return fieldMessage;
    }

    return err.message || `Request failed (${err.status})`;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
