import { motion } from 'framer-motion';
import { useWidgetStore } from '../store';

export interface CardButton {
  id: string;
  label: string;
  value: string;
  url?: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  buttons?: CardButton[];
}

interface CardMessageProps {
  card: Card;
  onButtonClick: (value: string, label: string) => void;
}

export const CardMessage = ({ card, onButtonClick }: CardMessageProps) => {
  const { theme } = useWidgetStore();

  const headerBg = theme.header.backgroundColor;
  const headerText = theme.header.textColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="lr-rounded-xl lr-shadow-sm lr-border lr-overflow-hidden lr-max-w-[260px]"
      style={{
        borderColor: theme.input.borderColor,
        backgroundColor: theme.messages.assistantBubbleColor,
      }}
    >
      {/* Optional image */}
      {card.imageUrl && (
        <div className="lr-w-full" style={{ aspectRatio: '16/9' }}>
          <img
            src={card.imageUrl}
            alt={card.title}
            className="lr-w-full lr-h-full lr-object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="lr-p-3">
        <h4
          className="lr-font-semibold lr-text-sm lr-leading-snug"
          style={{ color: theme.messages.assistantTextColor }}
        >
          {card.title}
        </h4>
        {card.description && (
          <p
            className="lr-text-xs lr-mt-1 lr-leading-relaxed"
            style={{
              color: theme.messages.assistantTextColor,
              opacity: 0.6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {card.description}
          </p>
        )}
      </div>

      {/* Buttons */}
      {card.buttons && card.buttons.length > 0 && (
        <div
          className="lr-px-3 lr-pb-3 lr-flex lr-flex-col lr-gap-1.5"
        >
          {card.buttons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => {
                if (btn.url) {
                  window.open(btn.url, '_blank', 'noopener,noreferrer');
                } else {
                  onButtonClick(btn.value, btn.label);
                }
              }}
              className="lr-w-full lr-px-3 lr-py-1.5 lr-text-xs lr-font-medium lr-rounded-lg lr-transition-all lr-duration-150"
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${headerBg}`,
                color: headerBg,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = headerBg;
                e.currentTarget.style.color = headerText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = headerBg;
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.97)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};
