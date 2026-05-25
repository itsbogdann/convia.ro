import { motion, AnimatePresence } from 'framer-motion';
import { useWidgetStore } from '../store';

/**
 * Persistent cart pill shown above the input when the conversation has an
 * active Shopify cart. Gives the visitor a one-tap path to checkout without
 * waiting for the AI to re-share the link.
 */
export const CartPill = () => {
  const { shopifyCart, theme } = useWidgetStore();

  const hasCart = !!shopifyCart && !!shopifyCart.cartId && !!shopifyCart.checkoutUrl;

  if (!hasCart) return null;

  const qty = shopifyCart!.totalQuantity ?? 0;
  const total = shopifyCart!.totalAmount;
  const currency = shopifyCart!.currency || 'USD';

  // Currency formatter with safe fallback if the currency code is unknown
  const formatMoney = (amount: number | undefined): string => {
    if (amount == null) return '';
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  const primary = theme.messages.userBubbleColor || '#3B82F6';
  const onPrimary = theme.messages.userTextColor || '#FFFFFF';

  const handleCheckout = () => {
    window.open(shopifyCart!.checkoutUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <motion.div
        key="cart-pill"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="lr-px-3 lr-pt-2"
      >
        <button
          type="button"
          onClick={handleCheckout}
          className="lr-w-full lr-flex lr-items-center lr-justify-between lr-gap-3 lr-px-3.5 lr-py-2.5 lr-rounded-full lr-text-sm lr-font-semibold lr-transition-transform hover:lr-scale-[1.01] active:lr-scale-[0.99] lr-shadow-sm"
          style={{ backgroundColor: primary, color: onPrimary }}
          aria-label="Go to checkout"
        >
          <span className="lr-flex lr-items-center lr-gap-2 lr-min-w-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lr-flex-shrink-0">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="lr-truncate">
              {qty > 0 ? `${qty} ${qty === 1 ? 'item' : 'items'}` : 'Your cart'}
              {total != null ? ` · ${formatMoney(total)}` : ''}
            </span>
          </span>
          <span className="lr-flex lr-items-center lr-gap-1 lr-flex-shrink-0">
            Checkout
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
