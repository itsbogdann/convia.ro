"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Rocket, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { Industry, WidgetPosition, type Agent } from "@convia/shared-types";
import { Stepper, type StepperItem } from "@/app/onboarding/_components/stepper";
import {
  StepIndustry,
  INDUSTRY_LABELS,
} from "@/app/onboarding/_components/step-industry";
import {
  COLOR_OPTIONS,
  StepBrand,
} from "@/app/onboarding/_components/step-brand";
import {
  StepKnowledge,
  normalizeUrl,
  validateUrl,
} from "@/app/onboarding/_components/step-knowledge";
import { StepChannels } from "@/app/onboarding/_components/step-channels";
import { StepInstall } from "@/app/onboarding/_components/step-install";
import { api, ApiError } from "@/lib/api/client";
import { useActiveTeam } from "@/lib/stores/active-team";
import { cn } from "@/lib/utils";

interface WizardState {
  industry: Industry | null;
  botName: string;
  botColor: string;
  websiteUrl: string;
  createdAgent: Agent | null;
  createdTeamId: string | null;
}

const STEP_TITLES = [
  {
    label: "Industria",
    title: "Ce tip de afacere ai?",
    subtitle: "Alegem împreună un punct de pornire potrivit. Poți schimba oricând.",
  },
  {
    label: "Brand bot",
    title: "Cum se cheamă botul tău?",
    subtitle: "Numele apare în chat. Alege și o culoare care reprezintă brandul.",
  },
  {
    label: "Cunoștințe",
    title: "De unde să învețe botul?",
    subtitle:
      "Adaugă site-ul tău și botul va citi automat conținutul. Sau sari peste.",
  },
  {
    label: "Canale",
    title: "Unde vrei să apară botul?",
    subtitle: "Selectează unde să trăiască botul. Adaugi canale noi oricând.",
  },
  {
    label: "Instalare",
    title: "Gata! Botul tău e activ.",
    subtitle: "Adaugă codul ăsta înainte de </body> pe site-ul tău.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const setActiveTeam = useActiveTeam((s) => s.setActiveTeam);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<WizardState>({
    industry: null,
    botName: "",
    botColor: COLOR_OPTIONS[0].hex,
    websiteUrl: "",
    createdAgent: null,
    createdTeamId: null,
  });

  const stepperItems: StepperItem[] = STEP_TITLES.map((step, idx) => ({
    id: step.label,
    label: step.label,
    value: getStepValue(idx, state),
  }));

  const meta = STEP_TITLES[currentIndex];
  const canBack = currentIndex > 0 && currentIndex < 4;
  const isFinal = currentIndex === 4;

  const canContinue = (() => {
    switch (currentIndex) {
      case 0:
        return state.industry !== null;
      case 1:
        return state.botName.trim().length >= 2;
      case 2:
        return validateUrl(state.websiteUrl);
      case 3:
        return true;
      default:
        return false;
    }
  })();

  const onBack = () => setCurrentIndex((i) => Math.max(0, i - 1));

  const onSkip = () => setCurrentIndex((i) => Math.min(4, i + 1));

  const onContinue = async () => {
    if (currentIndex < 3) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    if (currentIndex === 3) {
      await createBotAndAdvance();
    }
  };

  const createBotAndAdvance = async () => {
    if (!state.industry || !state.botName.trim()) {
      toast.error("Lipsește numele botului sau industria.");
      return;
    }

    setSubmitting(true);
    try {
      const team = await api.teams.create({
        name: `Workspace ${state.botName.trim()}`,
        settings: {
          brandColor: state.botColor,
          industry: state.industry,
          defaultLanguage: "ro",
        },
      });

      // Step 1: create the bot in DRAFT (API design — keep create payload minimal).
      const created = await api.agents.create(team.id, {
        name: state.botName.trim(),
        industry: state.industry,
        language: "ro",
      });

      // Step 2: apply the chosen brand color, welcome message, and chat title.
      await api.agents.update(team.id, created.id, {
        appearance: {
          primaryColor: state.botColor,
          chatTitle: state.botName.trim(),
          welcomeMessage: getWelcomeMessage(state.industry, state.botName.trim()),
          inputPlaceholder: "Scrie un mesaj...",
          position: WidgetPosition.BOTTOM_RIGHT,
          showBranding: true,
          avatarUrl: null,
        },
      });

      // Step 3: flip to ACTIVE so the widget actually answers visitors.
      const agent = await api.agents.publish(team.id, created.id);

      if (state.websiteUrl.trim()) {
        const url = normalizeUrl(state.websiteUrl);
        try {
          await api.knowledgeBase.documents.create(team.id, agent.id, {
            name: url,
            sourceType: "url",
            sourceUrl: url,
          });
        } catch (kbError) {
          console.error("Knowledge base seed failed:", kbError);
          toast.warning(
            "Botul e gata, dar n-am putut adăuga site-ul. Poți încerca din dashboard.",
          );
        }
      }

      setActiveTeam(team.id);
      setState((prev) => ({
        ...prev,
        createdAgent: agent,
        createdTeamId: team.id,
      }));
      setCurrentIndex(4);
      toast.success("Botul tău a fost creat!");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "N-am putut crea botul. Încearcă din nou.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const onGoToBot = () => {
    if (!state.createdAgent) return;
    router.push(`/agents/${state.createdAgent.id}`);
    router.refresh();
  };

  return (
    <div className="max-w-container mx-auto w-full grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-8 lg:gap-12">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-accent mb-4">
            Configurare bot
          </div>
          <Stepper steps={stepperItems} currentIndex={currentIndex} />
        </div>
      </aside>

      <section className="card p-6 lg:p-10 min-h-[480px] flex flex-col">
        <header className="mb-7">
          <h1 className="text-h3 font-gilroy text-ink leading-tight">
            {meta.title}
          </h1>
          <p className="text-[14.5px] text-ink-3 mt-2 leading-relaxed">
            {meta.subtitle}
          </p>
        </header>

        <div className="flex-1">
          {currentIndex === 0 && (
            <StepIndustry
              value={state.industry}
              onChange={(industry) => setState((p) => ({ ...p, industry }))}
            />
          )}
          {currentIndex === 1 && (
            <StepBrand
              name={state.botName}
              color={state.botColor}
              onChange={(next) =>
                setState((p) => ({
                  ...p,
                  botName: next.name ?? p.botName,
                  botColor: next.color ?? p.botColor,
                }))
              }
            />
          )}
          {currentIndex === 2 && (
            <StepKnowledge
              websiteUrl={state.websiteUrl}
              onChange={(websiteUrl) =>
                setState((p) => ({ ...p, websiteUrl }))
              }
            />
          )}
          {currentIndex === 3 && <StepChannels />}
          {currentIndex === 4 && state.createdAgent && (
            <StepInstall agent={state.createdAgent} />
          )}
        </div>

        <footer
          className={cn(
            "flex items-center gap-3 pt-7 mt-7 border-t border-line",
            isFinal ? "justify-end" : "justify-between",
          )}
        >
          {!isFinal && (
            <>
              <button
                type="button"
                onClick={onBack}
                disabled={!canBack || submitting}
                className="btn-ghost"
              >
                <ArrowLeft className="h-4 w-4" />
                Înapoi
              </button>

              <div className="flex items-center gap-2">
                {currentIndex === 2 && (
                  <button
                    type="button"
                    onClick={onSkip}
                    disabled={submitting}
                    className="btn-ghost"
                  >
                    <SkipForward className="h-4 w-4" />
                    Sari peste
                  </button>
                )}
                <button
                  type="button"
                  onClick={onContinue}
                  disabled={!canContinue || submitting}
                  className="btn-primary"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Se creează...
                    </>
                  ) : currentIndex === 3 ? (
                    <>
                      <Rocket className="h-4 w-4" />
                      Lansează botul
                    </>
                  ) : (
                    <>
                      Continuă
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {isFinal && (
            <button type="button" onClick={onGoToBot} className="btn-primary">
              Du-mă la bot
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

function getStepValue(
  index: number,
  state: WizardState,
): string | null {
  switch (index) {
    case 0:
      return state.industry ? INDUSTRY_LABELS[state.industry] : null;
    case 1:
      return state.botName.trim() ? state.botName.trim() : null;
    case 2:
      return state.websiteUrl.trim() ? state.websiteUrl.trim() : null;
    case 3:
      return state.createdAgent ? "Site web" : null;
    case 4:
      return state.createdAgent ? "Cod copiat ✓" : null;
    default:
      return null;
  }
}

function getWelcomeMessage(industry: Industry, botName: string): string {
  switch (industry) {
    case Industry.RESTAURANT:
      return `Salut! Sunt ${botName}. Vrei să afli orarul, meniul sau să rezervi o masă?`;
    case Industry.ECOMMERCE:
      return `Salut! Sunt ${botName}. Te ajut să găsești produsul potrivit sau să afli statusul comenzii.`;
    case Industry.SERVICII:
      return `Salut! Sunt ${botName}. Cu ce te pot ajuta azi?`;
    case Industry.HOTEL:
      return `Salut! Sunt ${botName}. Te ajut cu disponibilitate, rezervări sau detalii despre hotel.`;
    case Industry.OTHER:
    default:
      return `Salut! Sunt ${botName}. Cu ce te pot ajuta?`;
  }
}
