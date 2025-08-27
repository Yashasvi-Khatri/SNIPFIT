import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Youtube } from "lucide-react";

const Contact = () => {
  const locations = [
    {
      name: "Snipfit Sector 11",
      address: "Lower Ground Floor, RG Metro Arcade Complex, Sector 11, Rohini - 110085",
      phone: "+91 98108 92889",
      email: "sector11@snipfit.com",
      hours: "5:00 AM - 11:00 PM (Mon-Sun)"
    },
    {
      name: "Snipfit Sector 24",
      address: "Lower Ground Floor, Plot No-6, PKT-15A, Sector-24, Rohini, Delhi",
      phone: "+91 98108 92889",
      email: "sector24@snipfit.com",
      hours: "5:00 AM - 11:00 PM (Mon-Sun)"
    }
  ];

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="heading-section mb-6">
            Get In <span className="text-premium">Touch</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to transform your life? Contact us today to schedule your free consultation 
            and take the first step towards your fitness goals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="glass-card p-8 animate-slide-up">
            <h3 className="text-2xl font-oswald font-bold text-foreground mb-6">
              Start Your Journey Today
            </h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    placeholder="First Name"
                    className="bg-surface border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Last Name"
                    className="bg-surface border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    className="bg-surface border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    className="bg-surface border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              
              <div>
                <Textarea
                  placeholder="Tell us about your fitness goals..."
                  rows={4}
                  className="bg-surface border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              
              <Button className="w-full btn-hero">
                Book Free Consultation
              </Button>
            </form>
          </div>

          {/* Location Info */}
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {locations.map((location, index) => (
              <div key={index} className="glass-card p-6">
                <h3 className="text-xl font-oswald font-bold text-foreground mb-4">
                  {location.name}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary-glow mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{location.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{location.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{location.email}</span>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-sm">{location.hours}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Social Media */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-oswald font-bold text-foreground mb-4">
                Follow Our Journey
              </h3>
              <div className="flex gap-4">
                <Button size="sm" className="btn-ghost p-3">
                  <Instagram className="w-5 h-5" />
                </Button>
                <Button size="sm" className="btn-ghost p-3">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button size="sm" className="btn-ghost p-3">
                  <Youtube className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-muted-foreground text-sm mt-4">
                @SnipfitOfficial - Daily motivation, workout tips, and success stories
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-oswald font-bold text-foreground mb-4">
              Visit Us Today
            </h3>
            <p className="text-muted-foreground mb-6">
              Experience our facilities firsthand with a complimentary day pass and personal tour.
            </p>
            <Button className="btn-accent">
              Claim Your Free Day Pass
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;