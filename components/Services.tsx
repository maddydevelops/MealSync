import { Utensils, Truck, Users, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

const services = [
  {
    icon: Utensils,
    title: "Dine In",
    description: "Experience our elegant ambiance and impeccable service in person"
  },
  {
    icon: Truck,
    title: "Delivery",
    description: "Enjoy restaurant-quality meals delivered fresh to your doorstep"
  },
  {
    icon: Users,
    title: "Catering",
    description: "Elevate your events with our premium catering services"
  },
  {
    icon: Clock,
    title: "Reservations",
    description: "Book your table in advance for a seamless dining experience"
  }
];

const Services = () => {
  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Our <span className="text-gradient">Services</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We deliver exceptional dining experiences through multiple channels
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index}
              className="card-gradient border-border/50 p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-3">{service.title}</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
