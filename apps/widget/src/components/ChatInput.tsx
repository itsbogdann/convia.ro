import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { useWidgetStore } from '../store';
import { Send, Smile, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Convert a hex color string to rgba. Supports 3-char (#RGB) and 6-char (#RRGGBB) hex codes.
 */
function hexToRgba(hex: string, opacity: number): string {
  let sanitized = hex.replace('#', '');
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const ChatInput = () => {
  const { sendMessage, isTyping, theme, hasEnded, config, uploadFile, isUploading, uploadProgress } = useWidgetStore();
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping || hasEnded) return;

    sendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const glassEnabled = theme.chat.glassEffect === true;
  const glassBlur = theme.chat.glassBlur ?? 12;
  const glassOpacity = theme.chat.glassOpacity ?? 0.7;

  // Show attach button when file upload is enabled AND the theme setting allows it
  const fileUploadEnabled = config?.fileUpload?.enabled === true;
  const showAttachButton = theme.input.showAttachButton && fileUploadEnabled;

  // Build accept attribute from allowed types
  const acceptTypes = config?.fileUpload?.allowedTypes?.join(',') || undefined;

  return (
    <div
      className="lr-p-3 lr-shrink-0"
      style={{
        borderTop: `1px solid ${glassEnabled ? 'rgba(255, 255, 255, 0.18)' : theme.input.borderColor}`,
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        ...(glassEnabled
          ? {
              backgroundColor: hexToRgba(theme.input.backgroundColor, glassOpacity),
              backdropFilter: `blur(${glassBlur}px)`,
              WebkitBackdropFilter: `blur(${glassBlur}px)`,
            }
          : {}),
      }}
    >
      {/* Upload progress bar */}
      {isUploading && (
        <div className="lr-h-1 lr-bg-gray-200 lr-rounded-full lr-overflow-hidden lr-mb-2">
          <motion.div
            className="lr-h-full lr-rounded-full"
            style={{ backgroundColor: theme.input.sendButtonColor }}
            initial={{ width: 0 }}
            animate={{ width: `${uploadProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <div
        className="lr-flex lr-items-center lr-gap-2 lr-px-3 lr-py-2"
        style={{
          border: `1px solid ${theme.input.borderColor}`,
          backgroundColor: theme.input.backgroundColor,
          borderRadius: theme.input.borderRadius ?? 12,
        }}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="lr-hidden"
          accept={acceptTypes}
          onChange={handleFileChange}
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Attach button */}
        {showAttachButton && (
          <button
            className="lr-p-1 lr-transition-colors"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              color: theme.input.textColor,
              opacity: isUploading ? 0.3 : 0.6,
            }}
            onClick={handleAttachClick}
            disabled={isUploading || hasEnded}
            aria-label="Attach file"
          >
            <Paperclip className="lr-w-5 lr-h-5" />
          </button>
        )}

        {/* Input */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hasEnded ? 'Conversation ended' : theme.input.placeholder}
          disabled={isTyping || hasEnded}
          rows={1}
          className="lr-flex-1 lr-resize-none lr-text-sm lr-max-h-30 lr-min-h-[24px] disabled:lr-opacity-50"
          style={{
            color: theme.input.textColor,
            outline: 'none',
            border: 'none',
            background: 'transparent',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '16px', // >= 16px prevents iOS Safari auto-zoom on focus
            lineHeight: '20px',
            padding: 0,
          }}
        />

        {/* Emoji button */}
        {theme.input.showEmojiButton && (
          <button
            className="lr-p-1 lr-transition-colors"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: theme.input.textColor,
              opacity: 0.6,
            }}
            aria-label="Add emoji"
          >
            <Smile className="lr-w-5 lr-h-5" />
          </button>
        )}

        {/* Send button */}
        <motion.button
          onClick={handleSubmit}
          disabled={!input.trim() || isTyping || hasEnded}
          className="lr-p-2 lr-transition-colors lr-flex lr-items-center lr-justify-center disabled:lr-opacity-40"
          style={{
            backgroundColor: theme.input.sendButtonColor,
            borderRadius: theme.input.sendButtonBorderRadius ?? 8,
            border: 'none',
            cursor: 'pointer',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Send message"
        >
          <Send className="lr-w-4 lr-h-4 lr-text-white" />
        </motion.button>
      </div>
    </div>
  );
};
