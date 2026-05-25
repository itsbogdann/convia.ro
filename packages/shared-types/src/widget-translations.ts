/**
 * Convia widget translations.
 *
 * Single source of truth for every user-facing string the widget renders.
 * Defaults are Romanian; workspaces can override individual entries via the
 * dashboard. Variable interpolation supports {{n}}, {{type}}, etc.
 */

export interface WidgetTranslations {
  // ─── General UI ───────────────────────────────────────────────────────
  delivered?: string;
  thinking?: string;
  poweredBy?: string;
  viewAll?: string;
  justNow?: string;
  minutesAgo?: string;
  hoursAgo?: string;
  daysAgo?: string;
  inputPlaceholder?: string;

  // ─── Conversations list ───────────────────────────────────────────────
  noConversations?: string;
  startNewConversation?: string;
  startNewChat?: string;
  newConversation?: string;
  conversationsTitle?: string;

  // ─── Search ───────────────────────────────────────────────────────────
  searchPlaceholder?: string;
  searchTitle?: string;

  // ─── Feedback ─────────────────────────────────────────────────────────
  feedbackTitle?: string;
  leaveFeedbackTitle?: string;
  thankYou?: string;
  feedbackThanks?: string;
  backToHome?: string;
  rateExperience?: string;
  tellUsMore?: string;
  emailOptional?: string;
  commentPlaceholder?: string;
  submitting?: string;
  submitFeedback?: string;

  // ─── Help center ──────────────────────────────────────────────────────
  noHelpContent?: string;
  checkBackLater?: string;
  faqTitle?: string;
  latestUpdatesTitle?: string;

  // ─── Bot messages ─────────────────────────────────────────────────────
  defaultMessage?: string;
  aiFallback?: string;
  aiError?: string;
  inputPrompt?: string;
  invalidInput?: string;
  quickRepliesPrompt?: string;
  cardChooseOption?: string;
  endConversation?: string;
  humanHandoff?: string;

  // ─── Forms ────────────────────────────────────────────────────────────
  formIntro?: string;
  formSubmittedConfirmation?: string;
  formSubmitButton?: string;

  // ─── Errors ───────────────────────────────────────────────────────────
  apiCallError?: string;
  integrationError?: string;
  capacityError?: string;
  unavailableError?: string;
}

/** Romanian defaults — overrideable per workspace via the dashboard. */
export const WIDGET_TRANSLATION_DEFAULTS: Required<WidgetTranslations> = {
  // General UI
  delivered: 'Livrat',
  thinking: 'Mă gândesc...',
  poweredBy: 'Susținut de',
  viewAll: 'Vezi toate',
  justNow: 'Acum',
  minutesAgo: 'acum {{n}}m',
  hoursAgo: 'acum {{n}}h',
  daysAgo: 'acum {{n}}z',
  inputPlaceholder: 'Scrie un mesaj...',

  // Conversations list
  noConversations: 'Nicio conversație încă',
  startNewConversation: 'Începe o conversație pentru ajutor',
  startNewChat: 'Începe o conversație',
  newConversation: 'Conversație nouă',
  conversationsTitle: 'Conversații',

  // Search
  searchPlaceholder: 'Caută în ajutor...',
  searchTitle: 'Caută',

  // Feedback
  feedbackTitle: 'Feedback',
  leaveFeedbackTitle: 'Lasă feedback',
  thankYou: 'Mulțumim!',
  feedbackThanks:
    'Feedback-ul tău ne ajută să ne îmbunătățim. Apreciem timpul acordat.',
  backToHome: 'Înapoi acasă',
  rateExperience: 'Cum ai evalua experiența?',
  tellUsMore: 'Spune-ne mai multe (opțional)',
  emailOptional: 'Email (opțional)',
  commentPlaceholder: 'Ce ți-a plăcut? Ce ar putea fi mai bine?',
  submitting: 'Se trimite...',
  submitFeedback: 'Trimite feedback',

  // Help center
  noHelpContent: 'Niciun conținut de ajutor încă',
  checkBackLater: 'Revino mai târziu pentru întrebări frecvente și actualizări',
  faqTitle: 'Întrebări frecvente',
  latestUpdatesTitle: 'Actualizări recente',

  // Bot messages
  defaultMessage: 'Salut!',
  aiFallback: 'Îmi pare rău, nu am putut procesa cererea ta.',
  aiError:
    'Îmi pare rău, am întâmpinat o problemă procesând cererea ta. Te rog încearcă din nou.',
  inputPrompt: 'Te rog scrie:',
  invalidInput: 'Te rog introdu un {{type}} valid.',
  quickRepliesPrompt: 'Te rog alege o opțiune:',
  cardChooseOption: 'Alege o opțiune',
  endConversation: 'Mulțumim pentru conversație! La revedere.',
  humanHandoff: 'Te conectez cu un coleg. Te rog așteaptă...',

  // Forms
  formIntro: 'Te rog completează formularul de mai jos.',
  formSubmittedConfirmation: 'Mulțumim! Informațiile au fost trimise.',
  formSubmitButton: 'Trimite',

  // Errors
  apiCallError: 'A apărut o eroare. Te rog încearcă din nou mai târziu.',
  integrationError:
    'A apărut o eroare cu integrarea. Te rog încearcă din nou mai târziu.',
  capacityError:
    'Suntem la capacitate maximă și nu putem începe conversații noi. Te rog încearcă din nou mai târziu.',
  unavailableError:
    'Sunt momentan indisponibil din cauza încărcării. Te rog încearcă din nou mai târziu.',
};

/** Replace {{var}} placeholders inside a translation string. */
export function interpolateTranslation(
  text: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return text;
  let out = text;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
  }
  return out;
}
