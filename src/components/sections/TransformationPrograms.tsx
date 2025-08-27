import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Target, TrendingUp, Award } from "lucide-react";

const TransformationPrograms = () => {
  const programs = [
    {
      name: "CHALLENGER",
      duration: "8 Weeks",
      goal: "Quick Results",
      icon: <TrendingUp className="w-8 h-8" />,
      description: "Rapid transformation program for immediate visible results",
      highlights: [
        "High-intensity workouts",
        "Fast-track nutrition plan",
        "Weekly progress tracking",
        "Personal accountability coach"
      ],
      color: "from-accent to-accent-glow",
      badge: "POPULAR"
    },
    {
      name: "BODY BLAST",
      duration: "20 Weeks",
      goal: "Complete Makeover",
      icon: <Target className="w-8 h-8" />,
      description: "Comprehensive body transformation with sustainable habits",
      highlights: [
        "Scientific workout progression",
        "Metabolic conditioning",
        "Lifestyle coaching",
        "Body composition analysis"
      ],
      color: "from-primary to-primary-glow",
      badge: "BEST VALUE"
    },
    {
      name: "MOTIVATOR",
      duration: "45 Weeks",
      goal: "Life Change",
      icon: <Award className="w-8 h-8" />,
      description: "Long-term transformation with mindset and habit coaching",
      highlights: [
        "Behavioral psychology approach",
        "Advanced training protocols",
        "Comprehensive health optimization",
        "Ongoing motivation system"
      ],
      color: "from-success to-emerald-400",
      badge: "PREMIUM"
    },
    {
      name: "LIFESTYLE",
      duration: "52 Weeks",
      goal: "Total Wellness",
      icon: <Clock className="w-8 h-8" />,
      description: "Complete lifestyle transformation for permanent results",
      highlights: [
        "Holistic wellness approach",
        "Advanced biometric tracking",
        "Stress management training",
        "Lifetime support community"
      ],
      color: "from-purple-500 to-pink-500",
      badge: "ULTIMATE"
    }
  ];

  return (
    <section id="programs" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="heading-section mb-6">
            Transformation <span className="text-premium">Programs</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Scientifically designed programs that deliver real, measurable results. 
            Each program is customized to your fitness level and goals with dedicated support every step of the way.
          </p>
          
          {/* Success Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="glass-card px-6 py-4">
              <div className="text-2xl font-oswald font-bold text-primary-glow">95%</div>
              <div className="text-sm text-muted-foreground">Complete Programs</div>
            </div>
            <div className="glass-card px-6 py-4">
              <div className="text-2xl font-oswald font-bold text-accent">-25kg</div>
              <div className="text-sm text-muted-foreground">Average Weight Loss</div>
            </div>
            <div className="glass-card px-6 py-4">
              <div className="text-2xl font-oswald font-bold text-success">100%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Program Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {programs.map((program, index) => (
            <div
              key={program.name}
              className="glass-card p-8 hover-lift relative overflow-hidden group animate-scale-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${program.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${program.color} text-white`}>
                  {program.badge}
                </span>
              </div>

              {/* Program Header */}
              <div className="relative z-10">
                <div className={`w-16 h-16 mb-6 bg-gradient-to-r ${program.color} rounded-2xl flex items-center justify-center text-white`}>
                  {program.icon}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-3xl font-oswald font-bold text-foreground mb-2">
                    {program.name}
                  </h3>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-lg font-semibold text-primary-glow">
                      {program.duration}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Goal: {program.goal}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {program.description}
                  </p>
                </div>

                {/* Program Highlights */}
                <div className="space-y-3 mb-8">
                  {program.highlights.map((highlight, highlightIndex) => (
                    <div key={highlightIndex} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${program.color}`}></div>
                      <span className="text-sm text-muted-foreground">{highlight}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button className="w-full btn-ghost group">
                  Learn More About {program.name}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-oswald font-bold text-foreground mb-4">
              Ready to Start Your Transformation?
            </h3>
            <p className="text-muted-foreground mb-6">
              Book a free consultation with our transformation specialists to find the perfect program for your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-hero">
                Book Free Consultation
              </Button>
              <Button className="btn-ghost">
                View Success Stories
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransformationPrograms;