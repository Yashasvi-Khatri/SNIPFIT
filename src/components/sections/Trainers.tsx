import { motion } from 'framer-motion';
import SectionWrapper from '@/components/ui/SectionWrapper';

export interface Trainer {
  name: string;
  role: string;
  specialities: string[];
  experience: string;
  certifications: string[];
  bio: string;
  initials: string;
  colorClass: string;
}

const trainers: Trainer[] = [
  {
    name: 'Rahul Sharma',
    role: 'Head Strength Coach',
    specialities: ['Strength Training', 'Powerlifting', 'Body Recomposition'],
    experience: '8 years',
    certifications: ['NSCA-CSCS', 'CrossFit L2'],
    bio: 'Former national powerlifter turned coach. Helped 200+ members achieve their strength goals.',
    initials: 'RS',
    colorClass: 'bg-primary/20 text-primary',
  },
  {
    name: 'Priya Singh',
    role: 'Yoga & Wellness Coach',
    specialities: ['Power Yoga', 'Barre Fit', 'Meditation'],
    experience: '6 years',
    certifications: ['RYT-500', 'Barre Certified'],
    bio: 'Certified yoga therapist passionate about mind-body wellness and functional movement.',
    initials: 'PS',
    colorClass: 'bg-purple-500/20 text-purple-400',
  },
  {
    name: 'Amit Kumar',
    role: 'MMA & Combat Coach',
    specialities: ['MMA', 'Kickboxing', 'BJJ'],
    experience: '10 years',
    certifications: ['IBJJF Purple Belt', 'Kickboxing Instructor'],
    bio: 'Professional MMA fighter with 10 years of competition and coaching experience.',
    initials: 'AK',
    colorClass: 'bg-red-500/20 text-red-400',
  },
  {
    name: 'Neha Gupta',
    role: 'Nutrition & Cardio Coach',
    specialities: ['Nutrition', 'Zumba', 'HIIT'],
    experience: '5 years',
    certifications: ['Certified Nutritionist', 'Zumba Instructor'],
    bio: 'Registered dietitian and certified Zumba instructor helping members fuel their fitness.',
    initials: 'NG',
    colorClass: 'bg-teal-500/20 text-teal-400',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export interface TrainersProps {
  className?: string;
}

export default function Trainers({ className = '' }: TrainersProps) {
  return (
    <SectionWrapper id="trainers" variant="dark" className={className}>
      <motion.div className="mb-12 text-center">
        <p className="section-tag">THE EXPERTS</p>
        <h2 className="text-4xl font-bold text-white">
          MEET YOUR <span className="gradient-text">COACHES</span>
        </h2>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        {trainers.map((trainer) => (
          <motion.div
            key={trainer.name}
            variants={cardVariants}
            className="card card-hover p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(14,165,233,0.1)]"
          >
            <motion.div className="flex items-start gap-4">
              <motion.div
                className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold ${trainer.colorClass}`}
              >
                {trainer.initials}
              </motion.div>
              <motion.div>
                <h3 className="text-xl font-bold text-white">{trainer.name}</h3>
                <p className="text-sm text-primary">{trainer.role}</p>
              </motion.div>
            </motion.div>

            <p className="mt-4 text-sm leading-relaxed text-gray-450">{trainer.bio}</p>

            <motion.div className="mt-4 flex flex-wrap gap-2">
              {trainer.specialities.map((spec) => (
                <span
                  key={spec}
                  className="rounded-full border border-dark-border bg-dark-surface px-3 py-1 text-xs text-gray-450"
                >
                  {spec}
                </span>
              ))}
            </motion.div>

            <motion.div className="mt-4 space-y-1 text-sm text-gray-450">
              <p>
                <span className="text-white">Experience:</span> {trainer.experience}
              </p>
              <p>
                <span className="text-white">Certifications:</span>{' '}
                {trainer.certifications.join(', ')}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
