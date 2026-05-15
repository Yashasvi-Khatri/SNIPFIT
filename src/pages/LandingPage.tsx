import { Helmet } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import Programs from '@/components/sections/Programs';
import Pricing from '@/components/sections/Pricing';
import Trainers from '@/components/sections/Trainers';
import Gallery from '@/components/sections/Gallery';
import BmiCalculator from '@/components/sections/BmiCalculator';
import Contact from '@/components/sections/Contact';

export interface LandingPageProps {
  className?: string;
}

export default function LandingPage({ className = '' }: LandingPageProps) {
  return (
    <div className={`min-h-screen bg-[#0A0A0A] ${className}`}>
      <Helmet>
        <title>SNIPFIT Gym Rohini Delhi | Personal Training, Yoga, MMA | Free Trial</title>
        <meta
          name="description"
          content="Delhi's premier fitness studio in Rohini. Expert personal training, yoga, MMA, HIIT and nutrition programs. 500+ transformed members. Book your free trial today."
        />
        <meta property="og:title" content="SNIPFIT Gym | North Delhi's Best Gym" />
        <meta
          property="og:description"
          content="Transform your body at SNIPFIT Gym, Rohini. Expert coaches, 10+ programs, 2 locations."
        />
      </Helmet>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid #2A2A2A',
          },
          success: { iconTheme: { primary: '#0EA5E9', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />

      <Navbar />
      <main>
        <Hero />
        <Programs />
        <Pricing />
        <Trainers />
        <Gallery />
        <BmiCalculator />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
