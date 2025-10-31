import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Get In <span className="text-gradient">Touch</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Have questions or want to make a reservation? We'd love to hear from you
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="card-gradient border-border/50 p-8">
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                <Input 
                  id="name"
                  placeholder="Your name" 
                  className="bg-background/50 border-border"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="your@email.com" 
                  className="bg-background/50 border-border"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone</label>
                <Input 
                  id="phone"
                  type="tel" 
                  placeholder="(555) 000-0000" 
                  className="bg-background/50 border-border"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                <Textarea 
                  id="message"
                  placeholder="Tell us how we can help..." 
                  rows={4}
                  className="bg-background/50 border-border"
                />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow">
                Send Message
              </Button>
            </form>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            <Card className="card-gradient border-border/50 p-6 hover:shadow-glow transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold mb-2">Location</h3>
                  <p className="text-muted-foreground">
                    123 Culinary Avenue<br />
                    New York, NY 10001
                  </p>
                </div>
              </div>
            </Card>

            <Card className="card-gradient border-border/50 p-6 hover:shadow-glow transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold mb-2">Phone</h3>
                  <p className="text-muted-foreground">
                    +1 (555) 123-4567<br />
                    Mon-Sun: 11:00 AM - 11:00 PM
                  </p>
                </div>
              </div>
            </Card>

            <Card className="card-gradient border-border/50 p-6 hover:shadow-glow transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold mb-2">Email</h3>
                  <p className="text-muted-foreground">
                    info@noircuisine.com<br />
                    reservations@noircuisine.com
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
