"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperItem {
  id: string;
  label: string;
  value: string | null;
}

interface StepperProps {
  steps: StepperItem[];
  currentIndex: number;
}

export function Stepper({ steps, currentIndex }: StepperProps) {
  return (
    <div className="space-y-0">
      {steps.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.id} className="relative">
            <div className="flex gap-4">
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors flex-shrink-0",
                    isDone &&
                      "bg-accent text-white shadow-cta",
                    isCurrent &&
                      "bg-white text-accent border-2 border-accent shadow-ring-accent",
                    !isDone &&
                      !isCurrent &&
                      "bg-white text-soft border border-line-strong",
                  )}
                >
                  {isDone ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {!isLast && (
                  <div
                    className={cn(
                      "w-0 flex-1 mt-1 mb-1 border-l-2 border-dashed transition-colors",
                      isDone ? "border-accent/40" : "border-line-strong",
                    )}
                    style={{ minHeight: "32px" }}
                  />
                )}
              </div>

              <div className={cn("flex-1 pb-7", isLast && "pb-0")}>
                <div
                  className={cn(
                    "text-[14px] font-bold leading-tight transition-colors",
                    isCurrent ? "text-ink" : isDone ? "text-ink" : "text-ink-3",
                  )}
                >
                  {step.label}
                </div>
                {step.value && (
                  <div className="text-[12.5px] text-accent font-semibold mt-1 truncate">
                    {step.value}
                  </div>
                )}
                {!step.value && isCurrent && (
                  <div className="text-[12px] text-soft mt-1">În curs...</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
