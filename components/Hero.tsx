import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "../assests/hero-dish.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage.src}
          alt="Elegant gourmet dish"
          className="w-full h-full object-cover opacity-40 animate-zoom-slow"
        />
        <div className="absolute inset-0 from-background/80 via-background/60 to-background"></div>
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-up">
          <span className="text-gradient">MealSync</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up delay-200">
          Experience culinary excellence crafted with passion, precision, and the finest ingredients
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-300">
          {/* Shimmer Button */}
          <Button
            size="lg"
            className="relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-glow group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer" />
            <span className="relative flex items-center">
              View Menu
              <ArrowRight className="ml-2 h-5 w-5" />
            </span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-primary/30 hover:bg-primary/10 transition-all duration-300"
          >
            Reserve Table
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
