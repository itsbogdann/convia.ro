import React from 'react';
import { isSafeUrl } from '../utils/sanitize';

/**
 * Lightweight markdown renderer for the widget.
 * Supports: **bold**, *italic*, `code`, [links](url), lists, and line breaks.
 */
export const MarkdownText = ({ content }: { content: string }) => {
  const blocks = parseBlocks(content);
  return <>{blocks.map((block, i) => renderBlock(block, i))}</>;
};

interface Block {
  type: 'paragraph' | 'list' | 'code-block' | 'heading' | 'spacer';
  items?: string[];
  ordered?: boolean;
  startNum?: number;
  text?: string;
  lang?: string;
  level?: number;
}

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings (## or ###)
    const headingMatch = line.match(/^(#{2,3})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] });
      i++;
      continue;
    }

    // Fenced code block
    if (line.trimStart().startsWith('```')) {
      const lang = line.trimStart().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code-block', text: codeLines.join('\n'), lang });
      i++; // skip closing ```
      continue;
    }

    // Ordered list item (1. 2. etc.) — also consumes continuation lines and blank lines between items
    if (/^\d+\.\s/.test(line.trim())) {
      const items: string[] = [];
      let startNum = parseInt(line.trim().match(/^(\d+)\./)?.[1] || '1', 10);
      while (i < lines.length) {
        const currentLine = lines[i].trim();
        if (/^\d+\.\s/.test(currentLine)) {
          // New list item
          if (items.length === 0) {
            startNum = parseInt(currentLine.match(/^(\d+)\./)?.[1] || '1', 10);
          }
          items.push(currentLine.replace(/^\d+\.\s/, ''));
          i++;
        } else if (currentLine === '' && i + 1 < lines.length && /^\d+\.\s/.test(lines[i + 1].trim())) {
          // Blank line between ordered list items — skip it, keep the list going
          i++;
        } else if (currentLine !== '' && items.length > 0 && !/^[-*]\s/.test(currentLine) && !/^#{2,3}\s/.test(currentLine) && !currentLine.startsWith('```')) {
          // Continuation of previous list item (wrapped text)
          items[items.length - 1] += ' ' + currentLine;
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: 'list', items, ordered: true, startNum });
      continue;
    }

    // Unordered list item (- or *) — also consumes blank lines between items
    if (/^[-*]\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length) {
        const currentLine = lines[i].trim();
        if (/^[-*]\s/.test(currentLine)) {
          items.push(currentLine.replace(/^[-*]\s/, ''));
          i++;
        } else if (currentLine === '' && i + 1 < lines.length && /^[-*]\s/.test(lines[i + 1].trim())) {
          // Blank line between list items — skip it, keep the list going
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: 'list', items, ordered: false });
      continue;
    }

    // Empty line → spacer block for visual separation
    if (line.trim() === '') {
      // Only add spacer if previous block isn't already a spacer
      if (blocks.length === 0 || blocks[blocks.length - 1].type !== 'spacer') {
        blocks.push({ type: 'spacer' });
      }
      i++;
      continue;
    }

    // Paragraph: collect consecutive non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trimStart().startsWith('```') &&
      !/^\d+\.\s/.test(lines[i].trim()) &&
      !/^[-*]\s/.test(lines[i].trim()) &&
      !/^#{2,3}\s/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paraLines.join('\n') });
    }
  }

  return blocks;
}

function renderBlock(block: Block, key: number): React.ReactNode {
  if (block.type === 'code-block') {
    return (
      <pre
        key={key}
        className="lr-bg-black/20 lr-rounded lr-p-2 lr-text-xs lr-overflow-x-auto lr-my-1"
        style={{ margin: '4px 0' }}
      >
        <code>{block.text}</code>
      </pre>
    );
  }

  if (block.type === 'heading') {
    const Tag = block.level === 2 ? 'h2' : 'h3';
    const className = block.level === 2
      ? 'lr-text-base lr-font-bold'
      : 'lr-text-sm lr-font-semibold';
    return (
      <Tag key={key} className={className} style={{ margin: '8px 0 4px' }}>
        {renderInline(block.text || '')}
      </Tag>
    );
  }

  if (block.type === 'spacer') {
    return <div key={key} style={{ height: 8 }} />;
  }

  if (block.type === 'list') {
    const Tag = block.ordered ? 'ol' : 'ul';
    return (
      <Tag
        key={key}
        className={`${block.ordered ? 'lr-list-decimal' : 'lr-list-disc'} lr-pl-4`}
        style={{ margin: '4px 0' }}
        {...(block.ordered && block.startNum && block.startNum !== 1 ? { start: block.startNum } : {})}
      >
        {block.items!.map((item, j) => (
          <li key={j} className="lr-mb-0.5">{renderInline(item)}</li>
        ))}
      </Tag>
    );
  }

  // paragraph
  return (
    <p key={key} style={{ margin: '4px 0' }} className="first:lr-mt-0 last:lr-mb-0">
      {renderInline(block.text || '')}
    </p>
  );
}

function renderInline(text: string): React.ReactNode {
  // Process inline markdown: bold, italic, code, links
  const parts: React.ReactNode[] = [];
  // Regex to match ![alt](url), **bold**, *italic*, `code`, [text](url)
  const regex = /(!\[(.+?)\]\((.+?)\)|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      // ![alt](url) — only render if URL is safe
      if (isSafeUrl(match[3])) {
        parts.push(
          <img
            key={match.index}
            src={match[3]}
            alt={match[2]}
            className="lr-max-w-full lr-rounded-lg lr-my-2"
            style={{ maxHeight: 300, display: 'block' }}
          />
        );
      } else {
        parts.push(match[0]);
      }
    } else if (match[4]) {
      // **bold**
      parts.push(<strong key={match.index} className="lr-font-bold">{match[4]}</strong>);
    } else if (match[5]) {
      // *italic*
      parts.push(<em key={match.index} className="lr-italic">{match[5]}</em>);
    } else if (match[6]) {
      // `code`
      parts.push(
        <code key={match.index} className="lr-bg-black/20 lr-px-1 lr-py-0.5 lr-rounded lr-text-xs">
          {match[6]}
        </code>
      );
    } else if (match[7] && match[8]) {
      // [text](url) — only render as link if URL is safe
      if (isSafeUrl(match[8])) {
        parts.push(
          <a key={match.index} href={match[8]} target="_blank" rel="noopener noreferrer" className="lr-underline">
            {match[7]}
          </a>
        );
      } else {
        parts.push(match[0]);
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : parts;
}
