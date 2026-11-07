/** Public frontend access key, scoped by Web3Forms to the club recipient.
 * This is intentionally embedded in the website, not an account/API secret.
 * Docs: https://docs.web3forms.com/how-to-guides/js-frameworks/react-js/react-js
 * `email` is the documented default Reply-To; programme/request are custom fields.
 */
const ACCESS_KEY = "6646f74a-3893-40ca-8182-17cd03570c2c";
export const CONTACT_ENDPOINT = "https://api.web3forms.com/submit";
export const CONTACT_TIMEOUT_MS = 15_000;

export type ContactFields = {
  name: string;
  email: string;
  programme: string;
  request: string;
  message: string;
  language: string;
};
export type ContactResult = "success" | "rejected" | "unknown";

/** Exactly one POST. A missing acknowledgement is NOT proof of non-delivery. */
export async function submitContact(
  fields: ContactFields,
  timeoutMs = CONTACT_TIMEOUT_MS,
): Promise<ContactResult> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<ContactResult>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve("unknown");
    }, timeoutMs);
  });
  const request = async (): Promise<ContactResult> => {
    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          ...fields,
          access_key: ACCESS_KEY,
          subject: "New message from GUCC website",
          from_name: "GUCC website",
          botcheck: false,
        }),
      });
      const data: unknown = await response.json();
      if (!data || typeof data !== "object" || !("success" in data)) return "unknown";
      if (response.ok && data.success === true) return "success";
      // A gateway/rate-limit error may arrive after processing: never auto-retry it.
      if (response.status === 408 || response.status === 429 || response.status >= 500) return "unknown";
      return data.success === false ? "rejected" : "unknown";
    } catch {
      // Includes network/CORS errors, timeouts, and non-JSON responses.
      return "unknown";
    }
  };
  try {
    return await Promise.race([request(), timeout]);
  } finally {
    clearTimeout(timer);
  }
}
