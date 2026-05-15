import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Dumbbell, Users, Calendar, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminProps {
  className?: string;
}

const adminLinks = [
  { label: 'Manage Members', icon: Users, href: '/dashboard' },
  { label: 'Class Schedule', icon: Calendar, href: '/schedule' },
  { label: 'Memberships', icon: CreditCard, href: '/dashboard' },
];

export default function Admin({ className = '' }: AdminProps) {
  const { user, logout } = useAuth();

  return (
    <div className={`min-h-screen bg-[#0A0A0A] ${className}`}>
      <Helmet>
        <title>Admin Dashboard | SNIPFIT</title>
      </Helmet>

      <header className="border-b border-dark-border bg-dark-bg">
        <div className="container-max flex items-center justify-between px-4 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">
              <span className="text-white">SNIP</span>
              <span className="text-primary">FIT</span>
              <span className="ml-2 text-sm text-gray-450">Admin</span>
            </span>
          </Link>
          <button type="button" onClick={() => logout()} className="btn-ghost text-sm">
            Logout
          </button>
        </div>
      </header>

      <main className="section-padding">
        <div className="container-max">
          <h1 className="mb-2 text-3xl font-bold text-white">
            Welcome, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="mb-10 text-gray-450">SNIPFIT Admin Control Panel</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {adminLinks.map(({ label, icon: Icon, href }) => (
              <Link key={label} to={href} className="card card-hover flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="font-semibold text-white">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

