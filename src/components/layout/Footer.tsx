import { Link } from 'react-router-dom';
import {
  Dumbbell,
  Instagram,
  Youtube,
  Facebook,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Clock,
} from 'lucide-react';

export interface FooterLink {
  label: string;
  href: string;
}

const quickLinks: FooterLink[] = [
  { label: 'Home', href: '/#home' },
  { label: 'Programs', href: '/#programs' },
  { label: 'Trainers', href: '/#trainers' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Membership', href: '/#membership' },
  { label: 'Contact', href: '/#contact' },
  { label: 'Member Portal', href: '/dashboard' },
];

const programLinks: FooterLink[] = [
  { label: 'Personal Training', href: '/#programs' },
  { label: 'Power Yoga', href: '/#programs' },
  { label: 'Strength Training', href: '/#programs' },
  { label: 'MMA', href: '/#programs' },
  { label: 'Cardio Kickboxing', href: '/#programs' },
  { label: 'Barre Fit', href: '/#programs' },
  { label: 'Zumba', href: '/#programs' },
  { label: 'HIIT Training', href: '/#programs' },
  { label: 'Nutrition Counseling', href: '/#programs' },
];

const socialLinks = [
  { icon: Instagram, href: 'https://instagram.com/snipfit', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com/snipfit', label: 'YouTube' },
  { icon: Facebook, href: 'https://facebook.com/snipfit', label: 'Facebook' },
];

export interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  const scrollTo = (hash: string) => {
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderLink = (link: FooterLink) => {
    if (link.href.startsWith('/#')) {
      const hash = link.href.replace('/', '');
      return (
        <button
          key={link.label}
          type="button"
          onClick={() => scrollTo(hash)}
          className="flex items-center gap-1 text-sm text-gray-450 transition-colors hover:text-primary"
        >
          <ChevronRight className="h-3 w-3 text-primary" />
          {link.label}
        </button>
      );
    }
    return (
      <Link
        key={link.label}
        to={link.href}
        className="flex items-center gap-1 text-sm text-gray-450 transition-colors hover:text-primary"
      >
        <ChevronRight className="h-3 w-3 text-primary" />
        {link.label}
      </Link>
    );
  };

  return (
    <footer className={`border-t border-[#1F1F1F] bg-[#0D0D0D] ${className}`}>
      <div className="container-max px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold">
                <span className="text-white">SNIP</span>
                <span className="text-primary">FIT</span>
              </span>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-gray-450">
              Transform your body. Transform your life.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-dark-border text-gray-450 transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="section-tag">Quick Links</h3>
            <nav className="mt-4 flex flex-col gap-2">{quickLinks.map(renderLink)}</nav>
          </div>

          <div>
            <h3 className="section-tag">Our Programs</h3>
            <nav className="mt-4 flex flex-col gap-2">{programLinks.map(renderLink)}</nav>
          </div>

          <div>
            <h3 className="section-tag">Find Us</h3>
            <div className="mt-4 space-y-6">
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-gray-450">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Sector-11, Rohini, New Delhi - 110085</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-450">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <a href="tel:+919810892889" className="hover:text-primary">
                    +91 98108 92889
                  </a>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-gray-450">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Sector-24, Rohini, New Delhi - 110085</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-450">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <a href="tel:+919810892889" className="hover:text-primary">
                    +91 98108 92889
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-450">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href="mailto:info@snipfit.in" className="hover:text-primary">
                  info@snipfit.in
                </a>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-450">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Mon-Sat: 5:30 AM – 10:00 PM | Sun: 7 AM – 12 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#1F1F1F] px-4 py-6">
        <div className="container-max flex flex-col items-center justify-between gap-4 text-sm text-gray-450 sm:flex-row">
          <p>© 2025 SNIPFIT. All rights reserved.</p>
          <p>Made with ❤️ in Delhi</p>
        </div>
      </div>
    </footer>
  );
}
