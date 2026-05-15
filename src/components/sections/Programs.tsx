import { motion } from 'framer-motion';
import {
  Dumbbell,
  Flame,
  Wind,
  Swords,
  Heart,
  Music,
  Sparkles,
  Zap,
  Apple,
  LucideIcon,
} from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';

export interface ProgramItem {
  icon: LucideIcon;
  name: string;
  desc: string;
  colorClass: string;
}

const programs: ProgramItem[] = [
  {
    icon: Dumbbell,
    name: 'Personal Training',
    desc: 'One-on-one sessions tailored to your goals with expert coaches',
    colorClass: 'bg-primary/10 text-primary',
  },
  {
    icon: Flame,
    name: 'Strength Training',
    desc: 'Build raw strength and muscle with progressive overload programs',
    colorClass: 'bg-red-500/10 text-red-400',
  },
  {
    icon: Wind,
    name: 'Power Yoga',
    desc: 'Dynamic yoga flows that build flexibility, balance and inner strength',
    colorClass: 'bg-blue-500/10 text-blue-400',
  },
  {
    icon: Swords,
    name: 'MMA Training',
    desc: 'Mixed martial arts for fitness, self-defense and competitive sport',
    colorClass: 'bg-purple-500/10 text-purple-400',
  },
  {
    icon: Heart,
    name: 'Cardio Kickboxing',
    desc: 'High-energy cardio workouts combining kickboxing and fitness',
    colorClass: 'bg-pink-500/10 text-pink-400',
  },
  {
    icon: Music,
    name: 'Zumba',
    desc: 'Dance your way to fitness with Latin-inspired high-energy routines',
    colorClass: 'bg-yellow-500/10 text-yellow-400',
  },
  {
    icon: Sparkles,
    name: 'Barre Fit',
    desc: 'Ballet-inspired workouts for long lean muscles and core strength',
    colorClass: 'bg-teal-500/10 text-teal-400',
  },
  {
    icon: Zap,
    name: 'HIIT Training',
    desc: 'High-intensity intervals for maximum calorie burn in minimum time',
    colorClass: 'bg-primary/10 text-primary',
  },
  {
    icon: Apple,
    name: 'Nutrition Counseling',
    desc: 'Personalized diet plans and nutritional guidance from certified experts',
    colorClass: 'bg-green-500/10 text-green-400',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export interface ProgramsProps {
  className?: string;
}

export default function Programs({ className = '' }: ProgramsProps) {
  return (
    <SectionWrapper id="programs" variant="dark" className={className}>
      <motion.div className="mb-12 text-center">
        <p className="section-tag">WHAT WE OFFER</p>
        <h2 className="mb-4 text-4xl font-bold text-white">
          OUR <span className="gradient-text">FITNESS PROGRAMS</span>
        </h2>
        <p className="mx-auto max-w-2xl text-gray-450">
          Find the perfect program for your fitness goals
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {programs.map((program) => {
          const Icon = program.icon;
          return (
            <motion.div
              key={program.name}
              variants={cardVariants}
              className="card card-hover group p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(14,165,233,0.1)]"
            >
              <motion.div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${program.colorClass}`}
              >
                <Icon className="h-5 w-5" />
              </motion.div>
              <h3 className="mt-4 text-lg font-semibold text-white">{program.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-450">{program.desc}</p>
              <span className="mt-4 inline-block text-sm text-primary transition-colors group-hover:text-primary-400">
                Learn More →
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </SectionWrapper>
  );
}
