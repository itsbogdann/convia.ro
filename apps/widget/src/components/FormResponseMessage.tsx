import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText } from 'lucide-react';
import { useWidgetStore } from '../store';

interface FormResponseMessageProps {
  fields: Array<{ label: string; value: string }>;
}

export const FormResponseMessage = ({ fields }: FormResponseMessageProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useWidgetStore();

  const bubbleBg = theme.messages.assistantBubbleColor;
  const textColor = theme.messages.assistantTextColor;
  const primaryColor = theme.header.backgroundColor;

  // Detect dark bubble
  const isDark = (() => {
    const hex = bubbleBg.replace('#', '');
    if (hex.length < 6) return false;
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) < 0.5;
  })();

  const subtleText = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  return (
    <div className="lr-w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lr-flex lr-items-center lr-gap-2 lr-w-full lr-text-left lr-py-1 lr-transition-opacity hover:lr-opacity-80"
      >
        <FileText size={14} style={{ color: primaryColor }} />
        <span className="lr-text-sm lr-font-medium" style={{ color: textColor }}>
          Your responses
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="lr-ml-auto"
        >
          <ChevronDown size={14} style={{ color: subtleText }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="lr-overflow-hidden"
          >
            <div
              className="lr-mt-2 lr-pt-2 lr-space-y-2"
              style={{ borderTop: `1px solid ${dividerColor}` }}
            >
              {fields.map((field, idx) => (
                <div key={idx}>
                  <div className="lr-text-xs lr-font-medium lr-mb-0.5" style={{ color: subtleText }}>
                    {field.label}
                  </div>
                  <div className="lr-text-sm" style={{ color: textColor }}>
                    {field.value || '—'}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormResponseMessage;
