import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMemberCard } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  CreditCard, 
  Dumbbell, 
  TrendingUp, 
  Calendar, 
  Settings, 
  LogOut,
  ArrowLeft,
  Download,
  Share2,
  CalendarClock
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
};

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/member/dashboard' },
  { id: 'card', label: 'My Card', icon: <CreditCard size={20} />, path: '/member/card' },
  { id: 'workouts', label: 'Workout Log', icon: <Dumbbell size={20} />, path: '/member/workouts' },
  { id: 'progress', label: 'Progress', icon: <TrendingUp size={20} />, path: '/member/progress' },
  { id: 'classes', label: 'Classes', icon: <Calendar size={20} />, path: '/member/classes' },
  { id: 'bookings', label: 'My Bookings', icon: <CalendarClock size={20} />, path: '/member/bookings' },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/member/settings' },
];

export default function MemberCard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: cardData, isLoading, error } = useMemberCard();
  const [activeNav, setActiveNav] = useState('card');
  const [isFlipped, setIsFlipped] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-500">
            <p>Failed to load card data. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar Navigation - Desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border min-h-screen p-4">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary">SNIPFIT</h1>
          </div>
          
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  navigate(item.path);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeNav === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/member/dashboard')}
              >
                <ArrowLeft size={24} />
              </Button>
              <h1 className="text-2xl font-bold">Digital Membership Card</h1>
            </header>

            {/* Card Container */}
            <div className="perspective-1000 mb-8">
              <div 
                className="relative w-full max-w-md mx-auto h-64 cursor-pointer transition-transform duration-500"
                style={{ perspective: '1000px' }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front of Card */}
                <div 
                  className={`absolute inset-0 w-full h-full bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white shadow-2xl transition-all duration-500 ${
                    isFlipped ? 'rotate-y-180 opacity-0' : 'rotate-y-0 opacity-100'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-2xl font-bold">SNIPFIT</h2>
                      <p className="text-sm opacity-80">Membership Card</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <CreditCard size={24} />
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm opacity-80 mb-1">Member Name</p>
                    <p className="text-xl font-semibold">{cardData?.data?.name || 'N/A'}</p>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm opacity-80 mb-1">Membership Plan</p>
                    <p className="text-lg font-semibold">
                      {cardData?.data?.plan || 'No Active Membership'}
                    </p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm opacity-80 mb-1">Member Since</p>
                      <p className="text-sm">
                        {cardData?.data?.memberSince 
                          ? format(new Date(cardData.data.memberSince), 'MMM yyyy')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm opacity-80 mb-1">Valid Until</p>
                      <p className="text-sm">
                        {cardData?.data?.expiryDate 
                          ? format(new Date(cardData.data.expiryDate), 'MMM yyyy')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Back of Card */}
                <div 
                  className={`absolute inset-0 w-full h-full bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl p-6 text-white shadow-2xl transition-all duration-500 ${
                    isFlipped ? 'rotate-y-0 opacity-100' : 'rotate-y-180 opacity-0'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    transformStyle: 'preserve-3d',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-sm opacity-80 mb-4 text-center">Scan QR Code at Check-in</p>
                    {cardData?.data?.qrData && (
                      <div className="bg-white p-4 rounded-xl">
                        <QRCodeSVG 
                          value={cardData.data.qrData}
                          size={150}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                    )}
                    <p className="text-xs opacity-60 mt-4 text-center">
                      {cardData?.data?.memberId}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="flex justify-center gap-4 mb-8">
              <Button 
                variant="outline" 
                onClick={() => setIsFlipped(!isFlipped)}
                className="gap-2"
              >
                {isFlipped ? 'Show Front' : 'Show QR Code'}
              </Button>
              <Button 
                variant="outline"
                className="gap-2"
              >
                <Download size={16} />
                Save Card
              </Button>
              <Button 
                variant="outline"
                className="gap-2"
              >
                <Share2 size={16} />
                Share
              </Button>
            </div>

            {/* Member Information */}
            <div className="bg-surface p-6 rounded-lg border border-border">
              <h2 className="text-xl font-semibold mb-4">Member Information</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Member ID</span>
                  <span className="font-mono font-semibold">{cardData?.data?.memberId}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-semibold">{cardData?.data?.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-semibold">{cardData?.data?.plan || 'No Active Plan'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-semibold">
                    {cardData?.data?.memberSince 
                      ? format(new Date(cardData.data.memberSince), 'MMMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Expiry Date</span>
                  <span className="font-semibold">
                    {cardData?.data?.expiryDate 
                      ? format(new Date(cardData.data.expiryDate), 'MMMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">How to Use Your Digital Card</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Show this card at the front desk for check-in</li>
                <li>• Staff can scan the QR code for quick verification</li>
                <li>• Click the card to flip between front and QR code view</li>
                <li>• Save the card to your phone for offline access</li>
              </ul>
            </div>
          </div>
        </main>

        {/* Bottom Tab Bar - Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-2">
          <div className="flex justify-around">
            {navItems.slice(0, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  navigate(item.path);
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  activeNav === item.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {item.icon}
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 p-2 rounded-lg text-muted-foreground"
            >
              <LogOut size={20} />
              <span className="text-xs">Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
