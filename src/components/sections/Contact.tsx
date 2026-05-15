import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { MapPin, Phone, Mail, Clock, Loader2, MessageCircle } from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import { apiClient } from '@/lib/api';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  interest: z.string().min(1, 'Please select an interest'),
  message: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const interestOptions = [
  'Membership Enquiry',
  'Personal Training',
  'Group Classes',
  'Transformation Program',
  'Book Free Trial',
  'Other',
];

export interface LocationInfo {
  name: string;
  address: string;
  phone: string;
  hours: string;
  mapsUrl: string;
}

const locations: LocationInfo[] = [
  {
    name: 'Snipfit Sector 11',
    address:
      'Lower Ground Floor, RG Metro Arcade Complex, Sector 11, Rohini - 110085',
    phone: '+91 98108 92889',
    hours: '5:00 AM - 11:00 PM (Mon-Sun)',
    mapsUrl: 'https://maps.google.com/?q=Snipfit+Sector+11+Rohini',
  },
  {
    name: 'Snipfit Sector 24',
    address: 'Lower Ground Floor, Plot No-6, PKT-15A, Sector-24, Rohini, Delhi',
    phone: '+91 98108 92889',
    hours: '5:00 AM - 11:00 PM (Mon-Sun)',
    mapsUrl: 'https://maps.google.com/?q=Snipfit+Sector+24+Rohini',
  },
];

export interface ContactProps {
  className?: string;
}

export default function Contact({ className = '' }: ContactProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { message: '' },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.contact.submit({
        name: data.name,
        email: data.email,
        phone: data.phone,
        interest: data.interest,
        message: data.message ?? '',
      });
      toast.success("Thank you! We'll contact you within 24 hours.");
      reset();
    } catch {
      toast.error('Something went wrong. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionWrapper id="contact" variant="dark" className={className}>
      <div className="mb-12 text-center">
        <p className="section-tag">REACH OUT</p>
        <h2 className="text-4xl font-bold text-white">
          GET IN <span className="gradient-text">TOUCH</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">GET IN TOUCH</h3>
          {locations.map((location) => (
            <div key={location.name} className="card p-6">
              <h4 className="mb-4 font-bold text-primary">{location.name}</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-gray-450">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{location.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-450">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <a href={`tel:${location.phone.replace(/\s/g, '')}`} className="hover:text-primary">
                    {location.phone}
                  </a>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-450">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{location.hours}</span>
                </div>
                <a
                  href={location.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-primary hover:underline"
                >
                  Get Directions →
                </a>
              </div>
            </div>
          ))}

          <div className="card space-y-3 p-6">
            <div className="flex items-center gap-3 text-sm text-gray-450">
              <Mail className="h-4 w-4 text-primary" />
              <a href="mailto:info@snipfit.in" className="hover:text-primary">
                info@snipfit.in
              </a>
            </div>
            <a
              href="https://wa.me/919810892889"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex w-full justify-center"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="card p-8">
          <h3 className="mb-6 text-xl font-bold text-white">Send Us a Message</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="mb-1 block text-sm text-gray-450">
                Full Name *
              </label>
              <input
                id="name"
                {...register('name')}
                placeholder="Your full name"
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-4 py-2.5 text-white placeholder:text-gray-550 focus:border-primary focus:outline-none"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm text-gray-450">
                Phone Number *
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="10-digit mobile number"
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-4 py-2.5 text-white placeholder:text-gray-550 focus:border-primary focus:outline-none"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-gray-450">
                Email *
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                placeholder="your@email.com"
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-4 py-2.5 text-white placeholder:text-gray-550 focus:border-primary focus:outline-none"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="interest" className="mb-1 block text-sm text-gray-450">
                Interest *
              </label>
              <select
                id="interest"
                {...register('interest')}
                defaultValue=""
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-4 py-2.5 text-white focus:border-primary focus:outline-none"
              >
                <option value="" disabled>
                  Select your interest
                </option>
                {interestOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.interest && (
                <p className="mt-1 text-xs text-red-400">{errors.interest.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="message" className="mb-1 block text-sm text-gray-450">
                Message (optional)
              </label>
              <textarea
                id="message"
                {...register('message')}
                rows={4}
                placeholder="Tell us about your fitness goals..."
                className="w-full resize-none rounded-lg border border-dark-border bg-dark-bg px-4 py-2.5 text-white placeholder:text-gray-550 focus:border-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        </div>
      </div>
    </SectionWrapper>
  );
}
