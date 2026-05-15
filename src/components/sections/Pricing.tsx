import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';

export interface MembershipPlan {
  name: string;
  duration: string;
  price: number;
  popular: boolean;
  features: string[];
}

export interface TransformationPlan {
  name: string;
  duration: string;
  sessions: number;
  price: number;
  desc: string;
  popular: boolean;
  features: string[];
}

const memberships: MembershipPlan[] = [
  {
    name: 'INTRO',
    duration: '4 Weeks',
    price: 3999,
    popular: false,
    features: [
      'Strength Training Access',
      'Cardio Area Access',
      'Crossfit Zone',
      'Members App',
      'Group Classes (2/week)',
      'Locker Room Access',
    ],
  },
  {
    name: 'PLUS',
    duration: '12 Weeks',
    price: 7999,
    popular: true,
    features: [
      'Everything in INTRO',
      'Unlimited Group Classes',
      'Preset Workout Plan',
      'Basic Diet Plan',
      'Progress Tracking App',
      'Body Composition Analysis',
    ],
  },
  {
    name: 'PREMIUM',
    duration: '24 Weeks',
    price: 14999,
    popular: false,
    features: [
      'Everything in PLUS',
      '2 Personal Training Sessions/month',
      'Custom Diet Plan',
      'Nutrition Counseling',
      'Priority Class Booking',
      'Monthly Progress Photos',
    ],
  },
  {
    name: 'MAX',
    duration: '52 Weeks',
    price: 24999,
    popular: false,
    features: [
      'Everything in PREMIUM',
      '4 Personal Training Sessions/month',
      'Annual Body Assessment',
      'Guest Passes (4/year)',
      'Merchandise Discount 20%',
      'VIP Support',
    ],
  },
];

const transformations: TransformationPlan[] = [
  {
    name: 'Challenger',
    duration: '8 Weeks',
    sessions: 32,
    price: 19999,
    desc: 'Kickstart your transformation',
    popular: false,
    features: [
      '32 dedicated sessions',
      'Personalized workout plan',
      'Nutrition guidance',
      'Weekly progress check-ins',
      'Accountability coaching',
    ],
  },
  {
    name: 'Body Blast',
    duration: '20 Weeks',
    sessions: 80,
    price: 44999,
    desc: 'Complete body overhaul program',
    popular: true,
    features: [
      '80 dedicated sessions',
      'Custom diet plan',
      'Body composition tracking',
      'Bi-weekly assessments',
      'Priority trainer access',
      'Supplement guidance',
    ],
  },
  {
    name: 'Motivator',
    duration: '45 Weeks',
    sessions: 180,
    price: 89999,
    desc: 'Long-term sustainable change',
    popular: false,
    features: [
      '180 dedicated sessions',
      'Lifestyle coaching',
      'Advanced training protocols',
      'Monthly body scans',
      'Mindset coaching',
    ],
  },
  {
    name: 'Lifestyle',
    duration: '52 Weeks',
    sessions: 208,
    price: 99999,
    desc: 'Ultimate lifestyle transformation',
    popular: false,
    features: [
      '208 dedicated sessions',
      'Holistic wellness plan',
      'Stress management training',
      'Lifetime community access',
      'VIP support line',
      'Annual health assessment',
    ],
  },
];

type TabType = 'memberships' | 'transformations';

export interface PricingProps {
  className?: string;
}

export default function Pricing({ className = '' }: PricingProps) {
  const [activeTab, setActiveTab] = useState<TabType>('memberships');

  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <SectionWrapper id="membership" variant="darker" className={className}>
      <motion.div className="mb-12 text-center">
        <p className="section-tag">INVESTMENT IN YOURSELF</p>
        <h2 className="mb-4 text-4xl font-bold text-white">
          MEMBERSHIP <span className="gradient-text">PLANS</span>
        </h2>
        <p className="mx-auto max-w-2xl text-gray-450">
          Choose the plan that fits your transformation journey
        </p>
      </motion.div>

      {/* Toggle */}
      <motion.div className="mb-10 flex justify-center">
        <motion.div className="inline-flex rounded-full border border-dark-border bg-dark-card p-1">
          <button
            type="button"
            onClick={() => setActiveTab('memberships')}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
              activeTab === 'memberships'
                ? 'bg-primary text-white'
                : 'text-gray-450 hover:text-white'
            }`}
          >
            Memberships
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transformations')}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
              activeTab === 'transformations'
                ? 'bg-primary text-white'
                : 'text-gray-450 hover:text-white'
            }`}
          >
            Transformation Programs
          </button>
        </motion.div>
      </motion.div>

      {activeTab === 'memberships' ? (
        <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {memberships.map((plan) => (
            <motion.div
              key={plan.name}
              className={`card relative flex flex-col p-6 ${
                plan.popular ? 'border-primary ring-1 ring-primary/30' : ''
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <motion.div className="my-4">
                <span className="text-4xl font-black text-white">₹{plan.price.toLocaleString('en-IN')}</span>
                <p className="text-sm text-gray-450">{plan.duration}</p>
              </motion.div>
              <ul className="mb-6 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span className="text-gray-450">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={scrollToContact}
                className={plan.popular ? 'btn-primary w-full' : 'btn-secondary w-full'}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {transformations.map((plan) => (
            <motion.div
              key={plan.name}
              className={`card relative flex flex-col p-6 ${
                plan.popular ? 'border-primary ring-1 ring-primary/30' : ''
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="text-sm text-gray-450">{plan.desc}</p>
              <motion.div className="my-4">
                <span className="text-4xl font-black text-white">₹{plan.price.toLocaleString('en-IN')}</span>
                <p className="text-sm text-gray-450">
                  {plan.duration} · {plan.sessions} sessions
                </p>
              </motion.div>
              <ul className="mb-6 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span className="text-gray-450">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={scrollToContact}
                className={plan.popular ? 'btn-primary w-full' : 'btn-secondary w-full'}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </SectionWrapper>
  );
}
