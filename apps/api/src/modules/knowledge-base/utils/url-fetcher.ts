import * as cheerio from "cheerio";

export interface FetchedPage {
  title: string;
  text: string;
  language: string | null;
  contentLengthBytes: number;
}

const USER_AGENT =
  "ConviaBot/1.0 (+https://convia.ro/bots; ingest@convia.ro)";

const STRIP_SELECTORS = [
  "script",
  "style",
  "noscript",
  "iframe",
  "svg",
  "nav",
  "header",
  "footer",
  "aside",
  "form",
  "[role=navigation]",
  "[role=banner]",
  "[role=contentinfo]",
  ".cookie-banner",
  ".cookie-consent",
  "#cookie-banner",
];

/**
 * Fetch a single web page and extract its readable text.
 * No JavaScript execution — server-rendered pages only for MVP.
 * Throws if the URL is unreachable, returns a 4xx/5xx, or yields empty text.
 */
export async function fetchPage(rawUrl: string): Promise<FetchedPage> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error(`Invalid URL: ${rawUrl}`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Only http(s) URLs are supported`);
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ro,en;q=0.8",
      },
      redirect: "follow",
      // Reasonable cap so we don't hang on a slow server
      signal: AbortSignal.timeout(20_000),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to fetch ${url.toString()}: ${reason}`);
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url.toString()}: HTTP ${response.status}`,
    );
  }

  const contentType = response.headers.get("content-type") || "";
  if (
    !contentType.includes("text/html") &&
    !contentType.includes("application/xhtml")
  ) {
    throw new Error(`Unsupported content-type: ${contentType}`);
  }

  const html = await response.text();
  const contentLengthBytes = new TextEncoder().encode(html).byteLength;
  if (contentLengthBytes > 5 * 1024 * 1024) {
    throw new Error(
      `Page is too large (${Math.round(contentLengthBytes / 1024)} KB). Max is 5 MB.`,
    );
  }

  const $ = cheerio.load(html);

  // Strip noise
  for (const selector of STRIP_SELECTORS) {
    $(selector).remove();
  }
  // Drop any element marked aria-hidden
  $("[aria-hidden=\"true\"]").remove();

  const title =
    $("meta[property=\"og:title\"]").attr("content") ||
    $("title").first().text().trim() ||
    $("h1").first().text().trim() ||
    url.toString();

  const language =
    $("html").attr("lang")?.split("-")[0]?.toLowerCase() || null;

  // Prefer the largest text-bearing container if it exists (article, main).
  // Otherwise fall back to body.
  const candidate =
    $("main").first().text() ||
    $("article").first().text() ||
    $("body").text();

  const text = normalizeWhitespace(candidate);

  if (text.length < 50) {
    throw new Error(
      `Page produced too little text (${text.length} chars). The site may be JS-rendered.`,
    );
  }

  return {
    title: title.slice(0, 300),
    text,
    language,
    contentLengthBytes,
  };
}

function normalizeWhitespace(s: string): string {
  return s
    // Convert all whitespace runs to single spaces, but keep paragraph breaks
    .replace(/\u00A0/g, " ") // non-breaking space → space
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Compute a stable hash of the content to detect changes on re-fetch. */
export async function hashContent(text: string): Promise<string> {
  const crypto = await import("crypto");
  return crypto.createHash("sha256").update(text).digest("hex");
}
