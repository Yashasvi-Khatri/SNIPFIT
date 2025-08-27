import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star, Users, Calendar } from "lucide-react";
import heroImage from "@/assets/hero-gym.jpg";

const Hero = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Snipfit Premium Gym Interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8 text-sm font-medium">
            <Star className="w-4 h-4 text-accent" />
            <span className="text-foreground">North Delhi's #1 Premium Fitness Center</span>
          </div>

          {/* Main Heading */}
          <h1 className="heading-hero mb-6">
            TRANSFORM YOUR
            <br />
            <span className="text-premium">FITNESS JOURNEY</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience state-of-the-art equipment, expert trainers, and a community 
            that pushes you to achieve your ultimate fitness goals.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              onClick={() => scrollToSection("#membership")}
              className="btn-hero text-lg px-8 py-4 group"
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline"
              className="btn-ghost text-lg px-8 py-4 group"
            >
              <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              Watch Tour
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="glass-card p-6 hover-lift">
              <Users className="w-8 h-8 text-primary-glow mx-auto mb-3" />
              <div className="text-3xl font-oswald font-bold text-foreground mb-1">2500+</div>
              <div className="text-muted-foreground text-sm">Active Members</div>
            </div>
            
            <div className="glass-card p-6 hover-lift">
              <Calendar className="w-8 h-8 text-accent mx-auto mb-3" />
              <div className="text-3xl font-oswald font-bold text-foreground mb-1">5+</div>
              <div className="text-muted-foreground text-sm">Years Excellence</div>
            </div>
            
            <div className="glass-card p-6 hover-lift">
              <Star className="w-8 h-8 text-success mx-auto mb-3" />
              <div className="text-3xl font-oswald font-bold text-foreground mb-1">98%</div>
              <div className="text-muted-foreground text-sm">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;