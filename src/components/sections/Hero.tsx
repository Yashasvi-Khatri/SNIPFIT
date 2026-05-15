import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Users, Dumbbell, MapPin } from 'lucide-react';

export interface HeroProps {
  className?: string;
}

const headlineWords = ['YOUR', 'FITNESS', 'JOURNEY', 'STARTS', 'HERE'];

const wordVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

const stats = [
  { icon: Users, value: '500+', label: 'Members' },
  { icon: Dumbbell, value: '10+', label: 'Programs' },
  { icon: MapPin, value: '2', label: 'Locations' },
];

export default function Hero({ className = '' }: HeroProps) {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0A] ${className}`}
    >
      {/* Radial gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(14,165,233,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-32 text-center">
        {/* Tag pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center rounded-full border border-primary/40 px-4 py-1.5 text-sm text-primary"
        >
          🏋️ Delhi&apos;s #1 Transformation Gym
        </motion.div>

        {/* Staggered headline */}
        <h1 className="mb-6 flex flex-wrap justify-center gap-x-3 gap-y-1 text-5xl font-black tracking-tight md:text-7xl">
          {headlineWords.map((word, i) => (
            <motion.span
              key={word}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={wordVariants}
              className={word === 'HERE' ? 'text-primary' : 'text-white'}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mx-auto mb-10 max-w-2xl text-lg text-gray-450 md:text-xl"
        >
          North Delhi&apos;s premier transformation gym. 500+ members. 10+ specialized programs.
          Two Rohini locations.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <button
            type="button"
            onClick={() => scrollTo('#contact')}
            className="btn-primary px-8 py-4 text-lg transition-transform hover:scale-105"
          >
            Book Free Trial
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollTo('#programs')}
            className="btn-secondary px-8 py-4 text-lg transition-transform hover:scale-105"
          >
            View Programs
          </button>
        </motion.div>

        {/* Stats pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {stats.map(({ icon: Icon, value, label }) => (
            <motion.div
              key={label}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2"
            >
              <Icon className="h-4 w-4 text-primary" />
              <span className="font-bold text-white">{value}</span>
              <span className="text-sm text-gray-450">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <button
        type="button"
        onClick={() => scrollTo('#programs')}
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-primary"
      >
        <ChevronDown className="h-8 w-8" />
      </button>
    </section>
  );
}
