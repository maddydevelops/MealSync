
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import PopularDishes from "@/components/PopularDishes";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background">
      <Navbar />
        <Hero />
      <Services />
      <PopularDishes />
      <Contact />
      <Footer />
    </div>
  );
}
