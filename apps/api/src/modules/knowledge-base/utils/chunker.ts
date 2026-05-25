/**
 * Recursive text splitter for RAG.
 *
 * Splits text into chunks of ≈chunkSize characters with overlap between
 * adjacent chunks, preferring "natural" boundaries in this order:
 *   1. Paragraphs        (double newlines)
 *   2. Sentences         (. ! ? followed by space)
 *   3. Lines             (single newlines)
 *   4. Words             (spaces)
 *   5. Characters        (hard split — last resort)
 *
 * Inspired by LangChain's RecursiveCharacterTextSplitter. Pure function,
 * no external deps. Returns an array of chunk strings.
 */

export interface ChunkOptions {
  chunkSize: number;
  chunkOverlap: number;
}

const DEFAULT_SEPARATORS = ["\n\n", ". ", "! ", "? ", "\n", " ", ""];

export function chunkText(
  text: string,
  { chunkSize, chunkOverlap }: ChunkOptions,
): string[] {
  if (chunkOverlap >= chunkSize) {
    throw new Error("chunkOverlap must be less than chunkSize");
  }
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  if (!cleaned) return [];

  // Step 1: split using the separator hierarchy
  const pieces = splitRecursive(cleaned, DEFAULT_SEPARATORS, chunkSize);

  // Step 2: merge adjacent pieces back up to chunkSize, applying overlap
  return mergePiecesWithOverlap(pieces, chunkSize, chunkOverlap);
}

function splitRecursive(
  text: string,
  separators: string[],
  maxLen: number,
): string[] {
  if (text.length <= maxLen) return [text];

  // Find the first separator that actually appears in the text
  let chosenSeparator = "";
  let remainingSeparators = separators;
  for (let i = 0; i < separators.length; i++) {
    const sep = separators[i];
    if (sep === "" || text.includes(sep)) {
      chosenSeparator = sep;
      remainingSeparators = separators.slice(i + 1);
      break;
    }
  }

  // Empty separator = hard character split as fallback
  if (chosenSeparator === "") {
    const out: string[] = [];
    for (let i = 0; i < text.length; i += maxLen) {
      out.push(text.slice(i, i + maxLen));
    }
    return out;
  }

  const parts = text.split(chosenSeparator);
  const result: string[] = [];
  for (const part of parts) {
    if (part.length === 0) continue;
    // Re-attach the separator so chunks stay readable (except for empty sep)
    const piece = result.length === 0 ? part : chosenSeparator + part;
    if (piece.length <= maxLen) {
      result.push(piece);
    } else {
      // Still too big — recurse with the next separator
      const subPieces = splitRecursive(piece, remainingSeparators, maxLen);
      result.push(...subPieces);
    }
  }
  return result;
}

function mergePiecesWithOverlap(
  pieces: string[],
  chunkSize: number,
  chunkOverlap: number,
): string[] {
  const chunks: string[] = [];
  let buffer = "";

  for (const piece of pieces) {
    if (buffer.length + piece.length <= chunkSize) {
      buffer += piece;
      continue;
    }

    if (buffer.length > 0) {
      chunks.push(buffer.trim());
      // Start the next buffer with the tail of the previous one (overlap)
      buffer = takeTail(buffer, chunkOverlap) + piece;
    } else {
      // A single piece is bigger than chunkSize on its own; emit it anyway.
      chunks.push(piece.trim());
      buffer = takeTail(piece, chunkOverlap);
    }
  }

  if (buffer.trim().length > 0) {
    chunks.push(buffer.trim());
  }

  return chunks.filter((c) => c.length > 0);
}

function takeTail(s: string, n: number): string {
  if (n <= 0 || s.length === 0) return "";
  return s.slice(Math.max(0, s.length - n));
}

/**
 * Approximate token count for a string. Rough heuristic — 1 token ≈ 4 chars
 * for English/Romanian-ish content. Used for batching embedding API calls
 * so we stay under the 8191-token-per-request limit.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
