import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import ProductPreview from "../components/ProductPreview.jsx";
import Principles from "../components/Principles.jsx";
import Features from "../components/Features.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import Security from "../components/Security.jsx";
import FinalCta from "../components/FinalCta.jsx";
import Footer from "../components/Footer.jsx";

function Home() {
  return (
    <div id="top" className="min-h-screen bg-canvas text-ink">
      <Navbar />
      <main>
        <Hero />
        <ProductPreview />
        <Principles />
        <Features />
        <HowItWorks />
        <Security />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

export default Home;
