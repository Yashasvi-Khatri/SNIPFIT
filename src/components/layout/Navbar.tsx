import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Programs', href: '#programs' },
  { label: 'Trainers', href: '#trainers' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Membership', href: '#membership' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(href);
    }
  };

  const Logo = () => (
    <button type="button" onClick={() => scrollTo('#home')} className="flex items-center gap-2">
      <Dumbbell className="h-6 w-6 text-primary" />
      <span className="text-2xl font-bold">
        <span className="text-white">SNIP</span>
        <span className="text-primary">FIT</span>
      </span>
    </button>
  );

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b border-dark-border bg-dark-bg/95 backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-max flex items-center justify-between px-4 py-4 lg:px-8">
        <Logo />

        <ul className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <button
                type="button"
                onClick={() => scrollTo(link.href)}
                className="nav-link relative text-sm font-medium text-white transition-colors hover:text-primary after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-0 after:-translate-x-1/2 after:bg-primary after:transition-all hover:after:w-full"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/login" className="btn-ghost text-sm px-4 py-2">
            Member Login
          </Link>
          <button type="button" onClick={() => scrollTo('#contact')} className="btn-primary text-sm px-5 py-2.5">
            Free Trial
          </button>
        </div>

        <button
          type="button"
          className="text-white lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 top-0 z-40 flex flex-col bg-dark-bg/95 backdrop-blur-lg lg:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <Logo />
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X className="h-7 w-7 text-white" />
            </button>
          </div>
          <ul className="flex flex-1 flex-col items-center justify-center gap-8">
            {navLinks.map((link, i) => (
              <li key={link.href} className="animate-fadeUp" style={{ animationDelay: `${i * 0.05}s` }}>
                <button
                  type="button"
                  onClick={() => scrollTo(link.href)}
                  className="text-2xl font-semibold text-white hover:text-primary"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 p-8">
            <Link to="/login" className="btn-ghost w-full text-center py-3" onClick={() => setMenuOpen(false)}>
              Member Login
            </Link>
            <button type="button" className="btn-primary w-full py-3" onClick={() => scrollTo('#contact')}>
              Free Trial
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
