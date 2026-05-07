import Header from "../components/landing/Header";
import HeroSection from "../components/landing/HeroSection";
import StoryBand from "../components/landing/StoryBand";
import CollectionsSection from "../components/landing/CollectionsSection";
import PromiseSection from "../components/landing/PromiseSection";
import EditorialSection from "../components/landing/EditorialSection";
import CtaSection from "../components/landing/CtaSection";
import { collectionPreview, highlights, promises } from "../data/landingContent";

function LandingPage() {
  return (
    <div className="landing-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Header />

      <main>
        <HeroSection highlights={highlights} />
        <StoryBand />
        <CollectionsSection collectionPreview={collectionPreview} />
        <PromiseSection promises={promises} />
        <EditorialSection />
        <CtaSection />
      </main>
    </div>
  );
}

export default LandingPage;
