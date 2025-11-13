import Hero from "@/components/Hero";
import Services from "@/components/Services";
import ProductsSection from "@/components/ProductsSection";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Landingslider from "@/components/Landingslider";
import AIAgent from "@/components/Aiagent"
import PopularDishes from "@/components/PopularDishes";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background">
      <Navbar />
      <Hero />
      <Landingslider/>
      <ProductsSection />
      <PopularDishes/>
       <Services />
      <Contact />
      <Footer />
      <AIAgent/>
    </div>
  );
}
