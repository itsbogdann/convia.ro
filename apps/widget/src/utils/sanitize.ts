import DOMPurify from 'dompurify';

/**
 * Sanitize SVG strings to prevent XSS attacks using DOMPurify.
 */
export function sanitizeSvg(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['script', 'foreignObject', 'animate', 'set'],
    FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  });
}

/**
 * Check if a URL is safe by parsing it and checking the protocol.
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, 'https://placeholder.com');
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
