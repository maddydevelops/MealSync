import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import steakImage from "../assests/dish-steak.jpg";
import pastaImage from "../assests/dish-pasta.jpg";
import seafoodImage from "../assests/dish-seafood.jpg";

const dishes = [
  {
    name: "Prime Wagyu Steak",
    description: "Premium A5 Wagyu with truffle butter, seasonal vegetables",
    price: "$85",
    rating: 5.0,
    image: steakImage
  },
  {
    name: "Truffle Carbonara",
    description: "Handmade pasta with black truffle, pecorino, farm eggs",
    price: "$42",
    rating: 4.9,
    image: pastaImage
  },
  {
    name: "Pan-Seared Salmon",
    description: "Norwegian salmon, citrus glaze, asparagus, herb risotto",
    price: "$58",
    rating: 4.8,
    image: seafoodImage
  }
];

const PopularDishes = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Popular <span className="text-gradient">Dishes</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our most loved creations, crafted with passion and precision
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {dishes.map((dish, index) => (
            <Card 
              key={index}
              className="card-gradient border-border/50 overflow-hidden hover:shadow-glow transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={dish.image.src} 
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="text-sm font-semibold">{dish.rating}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-display text-2xl font-semibold">{dish.name}</h3>
                  <span className="text-primary font-bold text-xl">{dish.price}</span>
                </div>
                <p className="text-muted-foreground mb-4">{dish.description}</p>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Order Now
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10">
            View Full Menu
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularDishes;
