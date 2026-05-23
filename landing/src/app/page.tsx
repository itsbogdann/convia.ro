import { HeroSection } from "@/components/home/hero-section";
import { LiveDemoSection } from "@/components/home/live-demo-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { UseCasesSection } from "@/components/home/use-cases-section";
import { FeaturesSection } from "@/components/home/features-section";
import { ChannelsSection } from "@/components/home/channels-section";
import { KnowledgeBaseSection } from "@/components/home/knowledge-base-section";
import { PricingSection } from "@/components/home/pricing-section";
import { TrustSection } from "@/components/home/trust-section";
import { FaqSection } from "@/components/home/faq-section";
import { CtaSection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <div className="container-x">
        <div className="divider" />
      </div>
      <LiveDemoSection />
      <HowItWorksSection />
      <UseCasesSection />
      <FeaturesSection />
      <ChannelsSection />
      <KnowledgeBaseSection />
      <PricingSection />
      <TrustSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
