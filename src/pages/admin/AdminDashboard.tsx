import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminStats, useExpiringMembers, useMonthlyRevenue } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  UserPlus,
  IndianRupee,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  Download,
  MoreVertical,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Phone,
  Mail,
  CreditCard,
  Clock
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#FF6B2C', '#3B82F6', '#10B981', '#F59E0B'];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: expiringMembers } = useExpiringMembers();
  const { data: monthlyRevenue } = useMonthlyRevenue();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleWhatsApp = (phone: string, name: string, plan: string, daysLeft: number) => {
    const message = `Hi ${name}, your SNIPFIT ${plan} membership expires in ${daysLeft} days! Renew now at snipfit.in`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleEmail = (email: string, name: string) => {
    window.open(`mailto:${email}?subject=SNIPFIT Membership Renewal&body=Dear ${name},`, '_blank');
  };

  const planColors: Record<string, string> = {
    INTRO: 'bg-blue-100 text-blue-700',
    PLUS: 'bg-green-100 text-green-700',
    PREMIUM: 'bg-purple-100 text-purple-700',
    MAX: 'bg-orange-100 text-orange-700',
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const membershipDistribution = [
    { name: 'INTRO', value: stats?.activeMembersByPlan?.INTRO || 0 },
    { name: 'PLUS', value: stats?.activeMembersByPlan?.PLUS || 0 },
    { name: 'PREMIUM', value: stats?.activeMembersByPlan?.PREMIUM || 0 },
    { name: 'MAX', value: stats?.activeMembersByPlan?.MAX || 0 },
  ];

  const dailyAttendance = stats?.dailyAttendance || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="text-blue-500" size={18} />
                Total Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.totalMembers || 0}</p>
              <p className="text-sm text-muted-foreground">
                +{stats?.newThisMonth || 0} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserPlus className="text-green-500" size={18} />
                New This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.newThisMonth || 0}</p>
              <p className="text-sm text-muted-foreground">
                {stats?.memberGrowthRate >= 0 ? '+' : ''}{stats?.memberGrowthRate || 0}% growth
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <IndianRupee className="text-orange-500" size={18} />
                Revenue This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ₹{((stats?.thisMonthRevenue || 0) / 1000).toFixed(0)}K
              </p>
              <p className="text-sm text-muted-foreground">
                {stats?.revenueGrowthRate >= 0 ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <TrendingUp size={14} /> +{stats?.revenueGrowthRate || 0}%
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <TrendingDown size={14} /> {stats?.revenueGrowthRate || 0}%
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="text-purple-500" size={18} />
                Classes Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.classesToday || 0}</p>
              <p className="text-sm text-muted-foreground">
                {stats?.classesThisWeek || 0} this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenue?.slice(-6) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#FF6B2C" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Membership Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Membership Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={membershipDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {membershipDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Daily Attendance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Daily Check-ins (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dailyAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#FF6B2C" fill="#FF6B2C" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expiring Members */}
        {expiringMembers && expiringMembers.length > 0 && (
          <Card className="mb-8 border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle size={24} />
                Expiring Members ({expiringMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Plan</th>
                      <th className="text-left p-3">Expiry</th>
                      <th className="text-left p-3">Days Left</th>
                      <th className="text-left p-3">Phone</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiringMembers.map((member: any) => (
                      <tr key={member.id} className="border-b">
                        <td className="p-3 font-medium">{member.name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${planColors[member.plan]}`}>
                            {member.plan}
                          </span>
                        </td>
                        <td className="p-3">{format(new Date(member.expiryDate), 'MMM d, yyyy')}</td>
                        <td className="p-3">
                          <span className={`font-semibold ${member.daysLeft <= 3 ? 'text-red-600' : 'text-orange-600'}`}>
                            {member.daysLeft} days
                          </span>
                        </td>
                        <td className="p-3">{member.phone || 'N/A'}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleWhatsApp(member.phone, member.name, member.plan, member.daysLeft)}
                              disabled={!member.phone}
                            >
                              <Phone size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEmail(member.email, member.name)}
                            >
                              <Mail size={14} />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => navigate(`/admin/members/${member.id}/membership`)}
                            >
                              <CreditCard size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity?.slice(0, 10).map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-2 bg-surface-elevated rounded-full">
                    {activity.type === 'new_member' && <UserPlus className="text-blue-500" size={18} />}
                    {activity.type === 'payment' && <CreditCard className="text-green-500" size={18} />}
                    {activity.type === 'booking' && <Calendar className="text-purple-500" size={18} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
