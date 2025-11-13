"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const banners = [
  {
    image: "/slide1.jpg",
    label: "SUPER SALES OF THE YEAR",
    title: "Up to 70% OFF",
    subtitle: "Limited Time Offer",
    color: "from-sale via-red-500 to-pink-500"
  },
  {
    image: "/slide2.jpg",
    label: "11.11 MEGA DISCOUNT",
    title: "Mid Night Offero ma",
    subtitle: "Today Only - Don't Miss Out!",
    color: "from-primary via-orange-500 to-amber-500"
  },
  {
    image: "/slide3.jpg",
    label: "WEEKEND SPECIAL",
    title: "Buy 1 Burger Get 1 Free",
    subtitle: "Selected Items",
    color: "from-success via-green-500 to-emerald-500"
  },
  {
    image: "/slide4.jpg",
    label: "Get 70% OFF On Visa Card",
    title: "Fresh & Delicious",
    subtitle: "Premium Quality",
    color: "from-warning via-yellow-500 to-amber-500"
  },
];

const LandingSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="relative w-full h-[280px] md:h-[400px] overflow-hidden rounded-2xl shadow-lg group">
          {/* Banner Image with Overlay */}
          <div className="absolute inset-0 transition-transform duration-700">
            <img
              src={banners[currentIndex].image}
              alt={banners[currentIndex].label}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-linear-to-r ${banners[currentIndex].color} opacity-80`} />
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8">
            {/* Sale Label Badge */}
            <div className="mb-4 animate-bounce">
              <span className="inline-block bg-white text-black px-6 py-2 rounded-full font-bold text-xs md:text-sm tracking-wider shadow-lg">
                {banners[currentIndex].label}
              </span>
            </div>

            {/* Main Title */}
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-3 drop-shadow-2xl animate-fade-up">
              {banners[currentIndex].title}
            </h2>

            {/* Subtitle */}
            <p className="text-lg md:text-2xl text-white/95 mb-6 drop-shadow-lg animate-fade-up delay-200">
              {banners[currentIndex].subtitle}
            </p>

            {/* CTA Button */}
            <Button 
              size="lg"
              className="bg-white text-black hover:bg-white/90 font-semibold shadow-xl animate-fade-up delay-300"
            >
              Shop Now
            </Button>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute text-black right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white  p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                className={`transition-all rounded-full ${
                  idx === currentIndex 
                    ? "w-8 h-3 bg-white" 
                    : "w-3 h-3 bg-white/50 hover:bg-white/75"
                }`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to banner ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingSlider;
