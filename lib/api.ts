export const API_URL = (process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "")).replace(/\/$/, "");

export async function postJSON<T>(path: string, payload: unknown, signal?: AbortSignal): Promise<T> {
  if (!API_URL) throw new Error("The contact service is not available at the moment.");
  const response = await fetch(API_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
    cache: "no-store"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(typeof error?.detail === "string" ? error.detail : "We couldn't send your message. Please try again later.");
  }
  return response.json() as Promise<T>;
}
