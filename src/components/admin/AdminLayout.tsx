import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Badge from '@/components/ui/badge';

interface NavItem {
  name: string;
  path: string;
  icon: any;
  description?: string;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
    description: 'Overview and statistics'
  },
  {
    name: 'Members',
    path: '/admin/members',
    icon: Users,
    description: 'Member management'
  },
  {
    name: 'Classes',
    path: '/admin/classes',
    icon: Calendar,
    description: 'Class scheduling'
  },
  {
    name: 'Revenue',
    path: '/admin/revenue',
    icon: DollarSign,
    description: 'Financial reports'
  },
  {
    name: 'Notifications',
    path: '/admin/notifications',
    icon: Bell,
    description: 'System notifications'
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: Settings,
    description: 'Admin settings'
  }
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Close sidebar on route change on mobile
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get current page name for breadcrumb
  const currentPage = navItems.find(item => item.path === location.pathname) || navItems[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white"
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-500" />
            <span className="font-semibold text-white">SNIPFIT Admin</span>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:z-0 lg:pt-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Shield className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg">SNIPFIT</h1>
                <p className="text-xs text-slate-400">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                                (item.path !== '/admin' && location.pathname.startsWith(item.path));
                
                return (
                  <TooltipProvider key={item.path}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.path}
                          onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
                          className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                            ${isActive 
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }
                          `}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="font-medium">{item.name}</span>
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 bg-purple-500 rounded-full" />
                          )}
                        </Link>
                      </TooltipTrigger>
                      {item.description && (
                        <TooltipContent side="right" className="bg-slate-800 text-white">
                          {item.description}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">
                  {user?.name || 'Admin User'}
                </p>
                <Badge variant="sky" className="text-xs bg-purple-500/10 border-purple-500/20 text-purple-400">
                  ADMIN
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Breadcrumb Bar */}
        <div className="hidden lg:block fixed top-0 right-0 left-64 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Admin</span>
              <span className="text-slate-600">/</span>
              <span className="text-white font-medium">{currentPage.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'A'}
                </div>
                <div className="text-sm">
                  <p className="text-white font-medium">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-slate-400">{user?.email || ''}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="lg:pt-[73px]">
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}