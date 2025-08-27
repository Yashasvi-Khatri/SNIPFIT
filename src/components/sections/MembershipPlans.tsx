import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown, Infinity } from "lucide-react";

const MembershipPlans = () => {
  const plans = [
    {
      name: "INTRO",
      duration: "4 Weeks",
      price: "₹3,999",
      originalPrice: "₹5,999",
      icon: <Zap className="w-8 h-8" />,
      description: "Perfect to get started on your fitness journey",
      features: [
        "Complete gym access",
        "Basic workout plan",
        "Locker facility",
        "Health assessment",
        "2 group classes/week"
      ],
      popular: false,
    },
    {
      name: "PLUS",
      duration: "12 Weeks",
      price: "₹7,999",
      originalPrice: "₹12,999",
      icon: <Star className="w-8 h-8" />,
      description: "Most popular choice for consistent results",
      features: [
        "Complete gym access",
        "Personalized workout plan",
        "Locker + towel service",
        "Monthly body composition",
        "Unlimited group classes",
        "Nutrition consultation"
      ],
      popular: true,
    },
    {
      name: "PREMIUM",
      duration: "24 Weeks",
      price: "₹14,999",
      originalPrice: "₹24,999",
      icon: <Crown className="w-8 h-8" />,
      description: "Premium experience with personal attention",
      features: [
        "Complete gym access",
        "Personal trainer sessions",
        "Premium locker service",
        "Weekly progress tracking",
        "Unlimited classes + specialty",
        "Detailed nutrition plan",
        "Supplement guidance",
        "Priority booking"
      ],
      popular: false,
    },
    {
      name: "MAX",
      duration: "52 Weeks",
      price: "₹24,999",
      originalPrice: "₹49,999",
      icon: <Infinity className="w-8 h-8" />,
      description: "Ultimate transformation with lifetime support",
      features: [
        "Complete gym access",
        "Dedicated personal trainer",
        "VIP locker with amenities",
        "Weekly detailed assessments",
        "All classes + premium programs",
        "Complete nutrition coaching",
        "Supplement plan included",
        "24/7 trainer support",
        "Guest passes (4/month)"
      ],
      popular: false,
    },
  ];

  return (
    <section id="membership" className="py-24 bg-surface">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="heading-section mb-6">
            Choose Your <span className="text-premium">Fitness Plan</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Flexible membership options designed to fit your lifestyle and fitness goals. 
            All plans include access to our premium facilities and expert guidance.
          </p>
        </div>

        {/* Membership Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`membership-card ${plan.popular ? 'featured' : ''} animate-scale-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary to-primary-glow text-white px-6 py-2 rounded-full text-sm font-semibold animate-glow">
                    MOST POPULAR
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary to-primary-glow rounded-2xl flex items-center justify-center text-white">
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-oswald font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {plan.description}
                </p>
                
                {/* Pricing */}
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-oswald font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      {plan.originalPrice}
                    </span>
                  </div>
                  <div className="text-primary-glow font-medium">
                    {plan.duration}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button 
                className={`w-full ${plan.popular ? 'btn-hero' : 'btn-ghost'} group`}
              >
                Choose {plan.name}
                <Star className="ml-2 w-4 h-4 group-hover:rotate-12 transition-transform" />
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 animate-fade-in">
          <p className="text-muted-foreground mb-4">
            All memberships include complimentary fitness assessment and goal setting session
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="flex items-center gap-2 text-success">
              <Check className="w-4 h-4" />
              No joining fee
            </span>
            <span className="flex items-center gap-2 text-success">
              <Check className="w-4 h-4" />
              Flexible freeze options
            </span>
            <span className="flex items-center gap-2 text-success">
              <Check className="w-4 h-4" />
              Money-back guarantee
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MembershipPlans;