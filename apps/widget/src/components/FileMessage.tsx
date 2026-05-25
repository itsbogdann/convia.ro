import { useState } from 'react';
import { motion } from 'framer-motion';
import { File, Image, FileText, Download, ExternalLink } from 'lucide-react';
import { useWidgetStore } from '../store';

interface FileMessageProps {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Format file size to human-readable string (KB/MB)
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Truncate file name preserving extension
 */
function truncateFileName(name: string, maxLength = 28): string {
  if (name.length <= maxLength) return name;
  const ext = name.lastIndexOf('.') >= 0 ? name.slice(name.lastIndexOf('.')) : '';
  const base = name.slice(0, name.length - ext.length);
  const truncatedBase = base.slice(0, maxLength - ext.length - 3);
  return `${truncatedBase}...${ext}`;
}

/**
 * Get the appropriate icon based on MIME type
 */
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType === 'application/pdf') return FileText;
  return File;
}

export const FileMessage = ({ fileName, fileUrl, fileSize, mimeType }: FileMessageProps) => {
  const { theme } = useWidgetStore();
  const [imageError, setImageError] = useState(false);
  const isImage = mimeType.startsWith('image/') && !imageError;
  const IconComponent = getFileIcon(mimeType);

  const handleClick = () => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="lr-rounded-lg lr-border lr-overflow-hidden lr-max-w-[260px] lr-cursor-pointer"
      style={{
        borderColor: theme.input.borderColor,
        backgroundColor: theme.messages.assistantBubbleColor,
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Open file: ${fileName}`}
    >
      {/* Inline image thumbnail for image files */}
      {isImage && (
        <div className="lr-w-full">
          <img
            src={fileUrl}
            alt={fileName}
            className="lr-w-full lr-max-h-[200px] lr-object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* File info row */}
      <div className="lr-flex lr-items-center lr-gap-2.5 lr-p-2.5">
        <div
          className="lr-w-8 lr-h-8 lr-rounded-md lr-flex lr-items-center lr-justify-center lr-shrink-0"
          style={{
            backgroundColor: theme.header.backgroundColor + '15',
          }}
        >
          <IconComponent
            className="lr-w-4 lr-h-4"
            style={{ color: theme.header.backgroundColor }}
          />
        </div>

        <div className="lr-flex-1 lr-min-w-0">
          <p
            className="lr-text-xs lr-font-medium lr-leading-tight lr-truncate"
            style={{ color: theme.messages.assistantTextColor }}
            title={fileName}
          >
            {truncateFileName(fileName)}
          </p>
          <p
            className="lr-text-[10px] lr-mt-0.5"
            style={{ color: theme.messages.assistantTextColor, opacity: 0.5 }}
          >
            {formatFileSize(fileSize)}
          </p>
        </div>

        <div
          className="lr-w-6 lr-h-6 lr-rounded-full lr-flex lr-items-center lr-justify-center lr-shrink-0"
          style={{
            backgroundColor: theme.header.backgroundColor + '10',
          }}
        >
          {isImage ? (
            <ExternalLink
              className="lr-w-3 lr-h-3"
              style={{ color: theme.header.backgroundColor }}
            />
          ) : (
            <Download
              className="lr-w-3 lr-h-3"
              style={{ color: theme.header.backgroundColor }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};
