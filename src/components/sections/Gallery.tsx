import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';

export interface GalleryItem {
  label: string;
  heightClass: string;
}

const galleryItems: GalleryItem[] = [
  { label: 'Main Gym Floor', heightClass: 'h-64' },
  { label: 'Cardio Zone', heightClass: 'h-48' },
  { label: 'Yoga Studio', heightClass: 'h-56' },
  { label: 'MMA Ring', heightClass: 'h-72' },
  { label: 'Reception', heightClass: 'h-48' },
  { label: 'Locker Room', heightClass: 'h-56' },
];

export interface GalleryProps {
  className?: string;
}

export default function Gallery({ className = '' }: GalleryProps) {
  return (
    <SectionWrapper id="gallery" variant="darker" className={className}>
      <motion.div className="mb-12 text-center">
        <h2 className="mb-4 text-4xl font-bold text-white">
          OUR <span className="gradient-text">GYM</span>
        </h2>
        <p className="text-gray-450">State of the art facilities in Rohini, Delhi</p>
      </motion.div>

      {/* TODO: Replace placeholder divs with real <img> tags once client provides photos */}
      <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item, index) => (
          <motion.div
            key={item.label}
            className={`card-hover relative overflow-hidden rounded-xl ${item.heightClass} ${
              index === 3 ? 'sm:row-span-2' : ''
            }`}
          >
            <motion.div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-dark-muted to-dark-card transition-all duration-300 hover:scale-[1.02] hover:brightness-110">
              <Camera className="mb-2 h-10 w-10 text-gray-550 opacity-40" />
              <span className="text-xs text-gray-550 opacity-60">{item.label}</span>
            </motion.div>
            <motion.div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <span className="text-sm font-semibold text-white">{item.label}</span>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
