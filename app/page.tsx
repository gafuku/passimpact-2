import { Navbar } from "./components/Navbar";
import { SignedInRedirect } from "./components/portal/SignedInRedirect";
import { HeroSection } from "./components/HeroSection";
import { LogoCloud } from "./components/LogoCloud";
import { AgentSection } from "./components/AgentSection";
import { BentoFeaturesSection } from "./components/BentoFeaturesSection";
import { TestimonialSection } from "./components/TestimonialSection";
import { EnterpriseSecureSection } from "./components/EnterpriseSecureSection";
import { ResourcesSection } from "./components/ResourcesSection";
import { CtaBanner } from "./components/CtaBanner";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col font-sans bg-background text-foreground">
      <SignedInRedirect to="/portal" />
      <Navbar />
      <main id="main-content" className="flex flex-1 flex-col">
        <HeroSection />
        <LogoCloud />
        <AgentSection />
        <BentoFeaturesSection />
        <TestimonialSection />
        <EnterpriseSecureSection />
        <ResourcesSection />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
