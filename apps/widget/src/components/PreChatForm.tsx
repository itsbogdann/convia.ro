import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useWidgetStore } from '../store';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select';
  label: string;
  placeholder?: string;
  required: boolean;
  variableName: string;
  options?: Array<{ label: string; value: string }>;
}

interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

interface PreChatFormProps {
  steps: FormStep[];
  dismissable: boolean;
  submitButtonText: string;
  successMessage?: string;
  nodeId: string;
  onSubmit: (formData: Record<string, string>) => void;
  onDismiss?: () => void;
}

const inputTypeMap: Record<string, string> = {
  text: 'text',
  email: 'email',
  phone: 'tel',
  number: 'number',
  textarea: 'textarea',
  select: 'select',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;

function validateField(field: FormField, value: string): string | null {
  if (field.required && !value.trim()) {
    return `${field.label} is required`;
  }
  if (!value.trim()) return null;

  if (field.type === 'email' && !emailRegex.test(value)) {
    return 'Please enter a valid email address';
  }
  if (field.type === 'phone' && !phoneRegex.test(value)) {
    return 'Please enter a valid phone number';
  }
  if (field.type === 'number' && isNaN(Number(value))) {
    return 'Please enter a valid number';
  }
  return null;
}

export const PreChatForm = ({
  steps,
  dismissable,
  submitButtonText,
  successMessage,
  nodeId: _nodeId,
  onSubmit,
  onDismiss,
}: PreChatFormProps) => {
  const { theme } = useWidgetStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  const primaryColor = theme.header.backgroundColor;
  const chatBg = theme.chat.backgroundColor;
  const inputBg = theme.input.backgroundColor;
  const inputText = theme.input.textColor;
  const inputBorder = theme.input.borderColor;
  const assistantText = theme.messages.assistantTextColor;

  // Detect if theme is dark by checking luminance of chat background
  const isDark = (() => {
    const hex = chatBg.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) < 0.5;
  })();

  const labelColor = isDark ? 'rgba(255,255,255,0.85)' : '#374151';
  const subtleText = isDark ? 'rgba(255,255,255,0.5)' : '#6B7280';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB';
  const backBtnBg = isDark ? 'rgba(255,255,255,0.08)' : 'white';
  const backBtnHover = isDark ? 'rgba(255,255,255,0.14)' : '#F3F4F6';
  const backBtnText = isDark ? 'rgba(255,255,255,0.7)' : '#4B5563';
  const backBtnBorder = isDark ? 'rgba(255,255,255,0.15)' : '#E5E7EB';

  const updateField = useCallback((variableName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [variableName]: value }));
    // Clear error when user starts typing
    setErrors((prev) => {
      if (prev[variableName]) {
        const next = { ...prev };
        delete next[variableName];
        return next;
      }
      return prev;
    });
  }, []);

  const validateCurrentStep = useCallback((): boolean => {
    const stepFields = currentStepData?.fields || [];
    const newErrors: Record<string, string> = {};
    let isValid = true;

    for (const field of stepFields) {
      const value = formData[field.variableName] || '';
      const error = validateField(field, value);
      if (error) {
        newErrors[field.variableName] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [currentStepData, formData]);

  const handleNext = useCallback(() => {
    if (!validateCurrentStep()) return;

    if (isLastStep) {
      setIsSubmitted(true);
      onSubmit(formData);

      // Auto-dismiss after 1s
      setTimeout(() => {
        onDismiss?.();
      }, 1000);
    } else {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  }, [validateCurrentStep, isLastStep, formData, onSubmit, onDismiss]);

  const handleBack = useCallback(() => {
    setDirection(-1);
    setCurrentStep((prev) => prev - 1);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleNext();
      }
    },
    [handleNext]
  );

  // Slide variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  const renderField = (field: FormField) => {
    const value = formData[field.variableName] || '';
    const error = errors[field.variableName];
    const hasError = !!error;

    const baseInputClasses = `lr-w-full lr-px-3.5 lr-py-2.5 lr-text-sm lr-rounded-xl lr-border lr-transition-all lr-duration-200 lr-outline-none ${
      hasError
        ? 'lr-border-red-400 lr-ring-2 lr-ring-red-100'
        : 'focus:lr-ring-2 focus:lr-border-transparent'
    }`;

    const inputStyle: React.CSSProperties = {
      backgroundColor: inputBg,
      color: inputText,
      borderColor: hasError ? undefined : inputBorder,
      ...(hasError ? {} : { '--tw-ring-color': `${primaryColor}33` } as React.CSSProperties),
    };

    if (field.type === 'textarea') {
      return (
        <div key={field.id} className="lr-space-y-1.5">
          <label className="lr-block lr-text-sm lr-font-medium" style={{ color: labelColor }}>
            {field.label}
            {field.required && (
              <span className="lr-text-red-400 lr-ml-0.5">*</span>
            )}
          </label>
          <textarea
            value={value}
            onChange={(e) => updateField(field.variableName, e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={field.placeholder || ''}
            rows={3}
            className={baseInputClasses + ' lr-resize-none'}
            style={inputStyle}
          />
          <AnimatePresence mode="wait">
            {hasError && (
              <motion.p
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                className="lr-text-xs lr-text-red-500 lr-font-medium"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <div key={field.id} className="lr-space-y-1.5">
          <label className="lr-block lr-text-sm lr-font-medium" style={{ color: labelColor }}>
            {field.label}
            {field.required && (
              <span className="lr-text-red-400 lr-ml-0.5">*</span>
            )}
          </label>
          <div className="lr-relative">
            <select
              value={value}
              onChange={(e) => updateField(field.variableName, e.target.value)}
              className={baseInputClasses + ' lr-appearance-none lr-pr-10 lr-cursor-pointer'}
              style={{
                ...inputStyle,
                color: value ? inputText : subtleText,
              }}
            >
              <option value="">{field.placeholder || 'Select an option...'}</option>
              {(field.options || []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="lr-absolute lr-right-3 lr-top-1/2 lr-transform -lr-translate-y-1/2 lr-pointer-events-none">
              <ChevronRight size={14} className="lr-rotate-90" style={{ color: subtleText }} />
            </div>
          </div>
          <AnimatePresence mode="wait">
            {hasError && (
              <motion.p
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                className="lr-text-xs lr-text-red-500 lr-font-medium"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <div key={field.id} className="lr-space-y-1.5">
        <label className="lr-block lr-text-sm lr-font-medium" style={{ color: labelColor }}>
          {field.label}
          {field.required && (
            <span className="lr-text-red-400 lr-ml-0.5">*</span>
          )}
        </label>
        <input
          type={inputTypeMap[field.type] || 'text'}
          value={value}
          onChange={(e) => updateField(field.variableName, e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={field.placeholder || ''}
          className={baseInputClasses}
          style={inputStyle}
        />
        <AnimatePresence mode="wait">
          {hasError && (
            <motion.p
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              className="lr-text-xs lr-text-red-500 lr-font-medium"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="lr-absolute lr-inset-0 lr-z-50 lr-flex lr-items-end lr-justify-center lr-px-3 lr-pb-2"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
        className="lr-w-full lr-rounded-2xl lr-shadow-2xl lr-overflow-hidden lr-flex lr-flex-col"
        style={{ maxHeight: '88%', backgroundColor: chatBg }}
      >
        {/* Header */}
        <div
          className="lr-relative lr-px-5 lr-pt-5 lr-pb-4"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
          }}
        >
          {/* Shine overlay */}
          <div
            className="lr-absolute lr-inset-0 lr-opacity-10"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
            }}
          />

          {/* Dismiss button */}
          {dismissable && (
            <button
              onClick={onDismiss}
              className="lr-absolute lr-top-3 lr-right-3 lr-p-1.5 lr-rounded-full lr-transition-colors lr-z-10"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; }}
            >
              <X size={16} color="white" />
            </button>
          )}

          {/* Step indicator */}
          {totalSteps > 1 && (
            <div className="lr-flex lr-items-center lr-gap-1.5 lr-mb-3 lr-relative lr-z-10">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className="lr-h-1 lr-rounded-full lr-transition-all lr-duration-300"
                  style={{
                    flex: idx <= currentStep ? 2 : 1,
                    backgroundColor:
                      idx <= currentStep
                        ? 'rgba(255,255,255,0.9)'
                        : 'rgba(255,255,255,0.25)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Step title */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`header-${currentStep}`}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
              transition={{ duration: 0.2 }}
              className="lr-relative lr-z-10"
            >
              <h3 className="lr-text-lg lr-font-bold lr-text-white lr-leading-tight">
                {currentStepData?.title || 'Tell us about yourself'}
              </h3>
              {currentStepData?.description && (
                <p className="lr-text-sm lr-text-white/70 lr-mt-1">
                  {currentStepData.description}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Step counter */}
          {totalSteps > 1 && (
            <div className="lr-mt-2 lr-text-xs lr-font-semibold lr-text-white/50 lr-relative lr-z-10">
              Step {currentStep + 1} of {totalSteps}
            </div>
          )}
        </div>

        {/* Form Content */}
        <div className="lr-flex-1 lr-overflow-y-auto lr-overscroll-contain">
          <AnimatePresence mode="wait" custom={direction}>
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="lr-flex lr-flex-col lr-items-center lr-justify-center lr-py-12 lr-px-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="lr-w-16 lr-h-16 lr-rounded-full lr-flex lr-items-center lr-justify-center lr-mb-4"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 15,
                      delay: 0.25,
                    }}
                  >
                    <Check size={32} style={{ color: primaryColor }} strokeWidth={3} />
                  </motion.div>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="lr-text-base lr-font-semibold lr-text-center"
                  style={{ color: assistantText }}
                >
                  {successMessage || 'Thank you! Your response has been recorded.'}
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                key={`step-${currentStep}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="lr-px-5 lr-py-5 lr-space-y-4"
              >
                {currentStepData?.fields.map(renderField)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer buttons */}
        {!isSubmitted && (
          <div className="lr-px-5 lr-py-4 lr-border-t lr-flex lr-items-center lr-gap-3" style={{ borderColor }}>
            {!isFirstStep && (
              <button
                onClick={handleBack}
                className="lr-flex lr-items-center lr-gap-1.5 lr-px-4 lr-py-2.5 lr-text-sm lr-font-semibold lr-rounded-xl lr-border lr-transition-colors"
                style={{ backgroundColor: backBtnBg, color: backBtnText, borderColor: backBtnBorder }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = backBtnHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = backBtnBg;
                }}
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="lr-flex-1 lr-flex lr-items-center lr-justify-center lr-gap-2 lr-px-5 lr-py-2.5 lr-text-sm lr-font-semibold lr-text-white lr-rounded-xl lr-transition-all lr-duration-200 lr-shadow-md"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 4px 14px ${primaryColor}40`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 6px 20px ${primaryColor}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 14px ${primaryColor}40`;
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
            >
              {isLastStep ? submitButtonText : 'Next'}
              {!isLastStep && <ChevronRight size={16} />}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PreChatForm;
