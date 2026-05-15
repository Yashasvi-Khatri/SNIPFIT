import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionWrapper from '@/components/ui/SectionWrapper';

export type Gender = 'male' | 'female';

export interface ActivityLevel {
  label: string;
  description: string;
  factor: number;
}

const activityLevels: ActivityLevel[] = [
  { label: 'Sedentary', description: 'Desk job, little exercise', factor: 1.2 },
  { label: 'Lightly Active', description: '1-3 days/week exercise', factor: 1.375 },
  { label: 'Moderately Active', description: '3-5 days/week exercise', factor: 1.55 },
  { label: 'Very Active', description: '6-7 days/week exercise', factor: 1.725 },
  { label: 'Extremely Active', description: 'Athlete, physical job', factor: 1.9 },
];

export interface BmiCategory {
  label: string;
  min: number;
  max: number;
  color: string;
  recommendation: string;
}

const bmiCategories: BmiCategory[] = [
  { label: 'Underweight', min: 0, max: 18.5, color: '#3B82F6', recommendation: 'We recommend our Strength & Nutrition Counseling program to build healthy mass.' },
  { label: 'Normal Weight', min: 18.5, max: 25, color: '#22C55E', recommendation: 'Great foundation! Our PLUS Membership will help you optimize your performance.' },
  { label: 'Overweight', min: 25, max: 30, color: '#F59E0B', recommendation: 'Our Body Blast Transformation Program is designed for your goals.' },
  { label: 'Obese Class I', min: 30, max: 35, color: '#0EA5E9', recommendation: 'Our Challenger Program with dedicated coaching will kickstart your transformation.' },
  { label: 'Obese Class II', min: 35, max: 50, color: '#EF4444', recommendation: 'Our Challenger Program with dedicated coaching will kickstart your transformation.' },
];

function getBmiCategory(bmi: number): BmiCategory {
  return bmiCategories.find((c) => bmi < c.max) ?? bmiCategories[bmiCategories.length - 1]!;
}

function calculateBmr(gender: Gender, weight: number, height: number, age: number): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

export interface BmiCalculatorProps {
  className?: string;
}

export default function BmiCalculator({ className = '' }: BmiCalculatorProps) {
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [activityIndex, setActivityIndex] = useState(2);
  const [results, setResults] = useState<{
    bmi: number;
    bmr: number;
    tdee: number;
    category: BmiCategory;
  } | null>(null);

  const handleCalculate = () => {
    const bmi = weight / Math.pow(height / 100, 2);
    const bmr = calculateBmr(gender, weight, height, age);
    const tdee = bmr * activityLevels[activityIndex]!.factor;
    const category = getBmiCategory(bmi);
    setResults({ bmi, bmr, tdee, category });
  };

  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const bmiMarkerPosition = results
    ? Math.min(Math.max(((results.bmi - 15) / 25) * 100, 0), 100)
    : 0;

  return (
    <SectionWrapper id="bmi" variant="card" className={className}>
      <motion.div className="mb-12 text-center">
        <p className="section-tag">FREE HEALTH TOOL</p>
        <h2 className="mb-4 text-4xl font-bold text-white">
          CALCULATE YOUR <span className="gradient-text">BMI</span>
        </h2>
        <p className="text-gray-450">Understand your body and find the right program</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Calculator form */}
        <motion.div className="card space-y-6 p-6">
          {/* Gender */}
          <motion.div>
            <label className="mb-2 block text-sm font-medium text-gray-450">Gender</label>
            <motion.div className="flex gap-2">
              {(['male', 'female'] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all ${
                    gender === g
                      ? 'bg-primary text-white'
                      : 'border border-dark-border text-gray-450 hover:border-primary'
                  }`}
                >
                  {g}
                </button>
              ))}
            </motion.div>
          </motion.div>

          {/* Age */}
          <motion.div>
            <label htmlFor="age" className="mb-2 block text-sm font-medium text-gray-450">
              Age (years)
            </label>
            <input
              id="age"
              type="number"
              min={15}
              max={80}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full rounded-lg border border-dark-border bg-dark-bg px-4 py-2 text-white focus:border-primary focus:outline-none"
            />
          </motion.div>

          {/* Height */}
          <motion.div>
            <label htmlFor="height" className="mb-2 block text-sm font-medium text-gray-450">
              Height: {height} cm
            </label>
            <input
              id="height"
              type="number"
              min={120}
              max={220}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="mb-2 w-full rounded-lg border border-dark-border bg-dark-bg px-4 py-2 text-white focus:border-primary focus:outline-none"
            />
            <input
              type="range"
              min={120}
              max={220}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </motion.div>

          {/* Weight */}
          <motion.div>
            <label htmlFor="weight" className="mb-2 block text-sm font-medium text-gray-450">
              Weight: {weight} kg
            </label>
            <input
              id="weight"
              type="number"
              min={30}
              max={200}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="mb-2 w-full rounded-lg border border-dark-border bg-dark-bg px-4 py-2 text-white focus:border-primary focus:outline-none"
            />
            <input
              type="range"
              min={30}
              max={200}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </motion.div>

          {/* Activity */}
          <motion.div>
            <label htmlFor="activity" className="mb-2 block text-sm font-medium text-gray-450">
              Activity Level
            </label>
            <select
              id="activity"
              value={activityIndex}
              onChange={(e) => setActivityIndex(Number(e.target.value))}
              className="w-full rounded-lg border border-dark-border bg-dark-bg px-4 py-2 text-white focus:border-primary focus:outline-none"
            >
              {activityLevels.map((level, i) => (
                <option key={level.label} value={i}>
                  {level.label} — {level.description}
                </option>
              ))}
            </select>
          </motion.div>

          <button type="button" onClick={handleCalculate} className="btn-primary w-full py-3">
            Calculate
          </button>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="card space-y-6 p-6"
            >
              <motion.div className="text-center">
                <p className="text-sm text-gray-450">Your BMI</p>
                <p
                  className="text-5xl font-black"
                  style={{ color: results.category.color }}
                >
                  {results.bmi.toFixed(2)}
                </p>
                <p className="mt-1 font-semibold" style={{ color: results.category.color }}>
                  {results.category.label}
                </p>
              </motion.div>

              {/* Spectrum bar */}
              <motion.div>
                <p className="mb-2 text-xs text-gray-450">BMI Spectrum</p>
                <motion.div className="relative h-4 overflow-hidden rounded-full">
                  <motion.div className="flex h-full w-full">
                    {bmiCategories.map((cat) => (
                      <motion.div
                        key={cat.label}
                        className="h-full flex-1"
                        style={{ backgroundColor: cat.color }}
                      />
                    ))}
                  </motion.div>
                  <motion.div
                    className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-lg"
                    style={{ left: `calc(${bmiMarkerPosition}% - 10px)` }}
                  />
                </motion.div>
                <motion.div className="mt-1 flex justify-between text-xs text-gray-550">
                  <span>15</span>
                  <span>25</span>
                  <span>30</span>
                  <span>40+</span>
                </motion.div>
              </motion.div>

              <motion.div className="rounded-lg border border-dark-border bg-dark-bg p-4 text-center">
                <p className="text-sm text-gray-450">Your daily calorie needs</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(results.tdee).toLocaleString()} kcal
                </p>
                <p className="mt-1 text-xs text-gray-550">
                  BMR: {Math.round(results.bmr).toLocaleString()} kcal
                </p>
              </motion.div>

              <motion.div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
                <p className="text-sm leading-relaxed text-gray-450">
                  {results.category.recommendation}
                </p>
                <button
                  type="button"
                  onClick={scrollToContact}
                  className="btn-primary mt-4 w-full"
                >
                  Book Free Consultation
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {!results && (
          <motion.div className="card flex items-center justify-center p-6">
            <p className="text-center text-gray-550">
              Enter your details and click Calculate to see your results
            </p>
          </motion.div>
        )}
      </motion.div>
    </SectionWrapper>
  );
}
