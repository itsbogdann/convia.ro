import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface Citation {
  sourceName: string;
  content: string;
  score: number;
}

interface CitationsProps {
  citations: Citation[];
}

export const Citations = ({ citations }: CitationsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="lr-mt-2 lr-pt-2 lr-border-t lr-border-gray-200/50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lr-flex lr-items-center lr-gap-1 lr-text-xs lr-text-gray-400 hover:lr-text-gray-500 lr-transition-colors lr-cursor-pointer lr-bg-transparent lr-border-none lr-p-0"
      >
        <span>{citations.length} {citations.length === 1 ? 'source' : 'sources'}</span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="lr-inline-flex"
        >
          <ChevronDown size={12} />
        </motion.span>
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
            <div className="lr-mt-2 lr-space-y-0">
              {citations.map((citation, index) => (
                <div
                  key={index}
                  className={`lr-py-1.5 ${index < citations.length - 1 ? 'lr-border-b lr-border-gray-200/30' : ''}`}
                >
                  <div className="lr-text-xs lr-font-medium lr-text-gray-500">
                    {citation.sourceName}
                  </div>
                  <div className="lr-text-xs lr-text-gray-400 lr-mt-0.5 lr-leading-relaxed">
                    {citation.content.length > 150
                      ? `${citation.content.substring(0, 150)}...`
                      : citation.content}
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
