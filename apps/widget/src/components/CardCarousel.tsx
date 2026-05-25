import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useWidgetStore } from '../store';
import type { Card } from './CardMessage';

interface CardCarouselProps {
  cards: Card[];
  onButtonClick: (value: string, label: string) => void;
}

export const CardCarousel = ({ cards, onButtonClick }: CardCarouselProps) => {
  const { theme } = useWidgetStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const headerBg = theme.header.backgroundColor;
  const headerText = theme.header.textColor;

  // Track active card via IntersectionObserver
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = cardRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        }
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [cards.length]);

  const setCardRef = useCallback((el: HTMLDivElement | null, index: number) => {
    cardRefs.current[index] = el;
  }, []);

  return (
    <div className="lr-w-full">
      {/* Scrollable card container */}
      <div
        ref={scrollRef}
        className="lr-flex lr-gap-3 lr-overflow-x-auto lr-pb-2 lr-carousel-scroll"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <style>{`
          .lr-carousel-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            ref={(el) => setCardRef(el, index)}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: index * 0.08,
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
            className="lr-flex-shrink-0 lr-rounded-xl lr-shadow-sm lr-border lr-overflow-hidden"
            style={{
              scrollSnapAlign: 'start',
              minWidth: '240px',
              maxWidth: '260px',
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
              <div className="lr-px-3 lr-pb-3 lr-flex lr-flex-col lr-gap-1.5">
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
        ))}
      </div>

      {/* Pagination dots */}
      {cards.length > 1 && (
        <div className="lr-flex lr-justify-center lr-gap-1.5 lr-mt-2">
          {cards.map((_, index) => (
            <div
              key={index}
              className="lr-rounded-full lr-transition-all lr-duration-200"
              style={{
                width: activeIndex === index ? 16 : 6,
                height: 6,
                backgroundColor: activeIndex === index ? headerBg : `${headerBg}33`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
