import Navigation from "@/components/ui/navigation";
import Hero from "@/components/sections/Hero";
import MembershipPlans from "@/components/sections/MembershipPlans";
import TransformationPrograms from "@/components/sections/TransformationPrograms";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <MembershipPlans />
        <TransformationPrograms />
        <About />
        <Contact />
      </main>
      
      {/* Footer */}
      <footer className="bg-surface border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src="/lovable-uploads/e5e4a88c-8f39-4f3e-8735-1d935205248e.png" 
                alt="Snipfit Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="text-2xl font-oswald font-bold text-foreground">
                SNIPFIT
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Transform your fitness journey with North Delhi's premier gym experience.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <span>© 2024 Snipfit Fitness Center</span>
              <span>•</span>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Contact Us</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;