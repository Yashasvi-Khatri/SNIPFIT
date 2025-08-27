import { Button } from "@/components/ui/button";
import { Users, Award, MapPin, Clock } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Trainers",
      description: "Certified professionals with 10+ years experience in fitness and nutrition"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Premium Equipment",
      description: "State-of-the-art machines and free weights from leading international brands"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Prime Locations",
      description: "Convenient locations in North Delhi with easy accessibility and parking"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Flexible Hours",
      description: "Open 5 AM to 11 PM, 7 days a week to fit your busy schedule"
    }
  ];

  return (
    <section id="about" className="py-24 bg-surface">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="heading-section mb-6">
            Why Choose <span className="text-premium">Snipfit</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            More than just a gym - we're your partners in achieving lasting fitness and wellness. 
            Our holistic approach combines cutting-edge facilities with personalized attention.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card p-6 text-center hover-lift animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary to-primary-glow rounded-2xl flex items-center justify-center text-white">
                {feature.icon}
              </div>
              <h3 className="text-xl font-oswald font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="glass-card p-12">
            <h3 className="text-3xl font-oswald font-bold text-foreground mb-6">
              Our Mission
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              "At Snipfit, we believe fitness is not just about physical transformation—it's about 
              building confidence, discipline, and a lifestyle that empowers you to be your best self. 
              We're committed to providing world-class facilities, expert guidance, and unwavering 
              support to help you achieve goals you never thought possible."
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-hero">
                Schedule Tour
              </Button>
              <Button className="btn-ghost">
                Meet Our Team
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-oswald font-bold text-primary-glow mb-2">5+</div>
            <div className="text-muted-foreground text-sm">Years Excellence</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-oswald font-bold text-accent mb-2">2500+</div>
            <div className="text-muted-foreground text-sm">Happy Members</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-oswald font-bold text-success mb-2">50+</div>
            <div className="text-muted-foreground text-sm">Expert Trainers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-oswald font-bold text-foreground mb-2">2</div>
            <div className="text-muted-foreground text-sm">Premium Locations</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;