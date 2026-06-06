import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft,
  Edit,
  Shield,
  Calendar,
  Mail,
  Phone,
  User,
  CreditCard,
  Activity,
  Dumbbell,
  AlertTriangle,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Badge from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'MEMBER' | 'TRAINER' | 'ADMIN';
  planType: 'INTRO' | 'PLUS' | 'PREMIUM' | 'MAX' | null;
  membershipStatus: 'ACTIVE' | 'EXPIRED' | 'NONE';
  membershipExpiry: string | null;
  joinDate: string;
  avatarUrl: string | null;
  isSuspended: boolean;
}

interface MembershipHistory {
  id: string;
  planType: string;
  startDate: string;
  endDate: string;
  price: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  paymentRecorded: boolean;
}

interface PaymentHistory {
  id: string;
  amount: number;
  plan: string;
  date: string;
  paymentId?: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

interface BookingHistory {
  id: string;
  className: string;
  trainer: string;
  date: string;
  status: 'CONFIRMED' | 'ATTENDED' | 'NO_SHOW' | 'CANCELLED';
}

interface WorkoutStats {
  totalWorkouts: number;
  totalMeasurements: number;
  lastWorkoutDate?: string;
}

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('memberships');
  const [isChangeRoleDialogOpen, setIsChangeRoleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [newRole, setNewRole] = useState<'MEMBER' | 'TRAINER' | 'ADMIN'>('MEMBER');

  // Fetch member details
  const { data: member, isLoading: memberLoading } = useQuery<Member>({
    queryKey: ['admin', 'member', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/members/${id}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch member');
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch membership history
  const { data: membershipHistory } = useQuery<MembershipHistory[]>({
    queryKey: ['admin', 'member', id, 'memberships'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/members/${id}/memberships`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch membership history');
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch payment history
  const { data: paymentHistory } = useQuery<PaymentHistory[]>({
    queryKey: ['admin', 'member', id, 'payments'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/members/${id}/payments`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch payment history');
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch booking history
  const { data: bookingHistory } = useQuery<BookingHistory[]>({
    queryKey: ['admin', 'member', id, 'bookings'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/members/${id}/bookings`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch booking history');
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch workout stats
  const { data: workoutStats } = useQuery<WorkoutStats>({
    queryKey: ['admin', 'member', id, 'workouts'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/members/${id}/workouts`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch workout stats');
      return response.json();
    },
    enabled: !!id,
  });

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: async (role: 'MEMBER' | 'TRAINER' | 'ADMIN') => {
      const response = await fetch(`/api/admin/members/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to change role');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Role updated',
        description: 'Member role has been successfully updated.',
      });
      setIsChangeRoleDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin', 'member', id] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to change member role.',
        variant: 'destructive',
      });
    },
  });

  // Toggle suspension mutation
  const toggleSuspensionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/members/${id}/suspend`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to toggle suspension');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Account status updated',
        description: `Account has been ${member?.isSuspended ? 'unsuspended' : 'suspended'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'member', id] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update account status.',
        variant: 'destructive',
      });
    },
  });

  // Delete member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/members/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete member');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Member deleted',
        description: 'Member has been successfully deleted.',
      });
      setIsDeleteDialogOpen(false);
      navigate('/admin/members');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete member.',
        variant: 'destructive',
      });
    },
  });

  if (memberLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Member not found</p>
      </div>
    );
  }

  const statusColors = {
    ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/20',
    EXPIRED: 'bg-red-500/10 text-red-400 border-red-500/20',
    CANCELLED: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    NONE: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/members')}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Member Profile</h1>
          <p className="text-slate-400">View detailed member information and history</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt={member.name} />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-semibold">
                  {member.name.split(' ').map((n) => n[0]).join('')}
                </div>
              )}
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">{member.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className="bg-purple-500/10 border-purple-500/20 text-purple-400">
                      {member.role}
                    </Badge>
                    <Badge className={statusColors[member.membershipStatus]}>
                      {member.membershipStatus}
                    </Badge>
                    {member.isSuspended && (
                      <Badge className="bg-orange-500/10 border-orange-500/20 text-orange-400">
                        Suspended
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {member.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {member.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Joined {format(new Date(member.joinDate), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800/50 border-slate-700">
          <TabsTrigger value="memberships" className="data-[state=active]:bg-purple-500/20">
            <CreditCard className="h-4 w-4 mr-2" />
            Membership History
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-purple-500/20">
            <Activity className="h-4 w-4 mr-2" />
            Payment History
          </TabsTrigger>
          <TabsTrigger value="bookings" className="data-[state=active]:bg-purple-500/20">
            <Dumbbell className="h-4 w-4 mr-2" />
            Booking History
          </TabsTrigger>
          <TabsTrigger value="workouts" className="data-[state=active]:bg-purple-500/20">
            <Activity className="h-4 w-4 mr-2" />
            Workouts & Progress
          </TabsTrigger>
        </TabsList>

        {/* Membership History Tab */}
        <TabsContent value="memberships">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Membership History</CardTitle>
              <CardDescription className="text-slate-400">
                All memberships this member has ever held
              </CardDescription>
            </CardHeader>
            <CardContent>
              {membershipHistory && membershipHistory.length > 0 ? (
                <div className="space-y-4">
                  {membershipHistory.map((membership) => (
                    <div key={membership.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white">{membership.planType} Plan</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(membership.startDate), 'MMM dd, yyyy')} - {format(new Date(membership.endDate), 'MMM dd, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              ${membership.price}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[membership.status]}>
                            {membership.status}
                          </Badge>
                          {membership.paymentRecorded && (
                            <Badge className="bg-green-500/10 border-green-500/20 text-green-400">
                              Paid
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-8">No membership history found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="payments">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Payment History</CardTitle>
              <CardDescription className="text-slate-400">
                All payment transactions for this member
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentHistory && paymentHistory.length > 0 ? (
                <div className="space-y-4">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white">{payment.plan}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(payment.date), 'MMM dd, yyyy')}
                            </span>
                            {payment.paymentId && (
                              <span className="text-xs text-slate-500">ID: {payment.paymentId}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-white">${payment.amount}</span>
                          <Badge className={
                            payment.status === 'COMPLETED' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                            payment.status === 'PENDING' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                            'bg-red-500/10 border-red-500/20 text-red-400'
                          }>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-8">No payment history found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking History Tab */}
        <TabsContent value="bookings">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Booking History</CardTitle>
              <CardDescription className="text-slate-400">
                Class bookings and attendance records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookingHistory && bookingHistory.length > 0 ? (
                <div className="space-y-4">
                  {bookingHistory.map((booking) => (
                    <div key={booking.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white">{booking.className}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {booking.trainer}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(booking.date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </div>
                        <Badge className={
                          booking.status === 'ATTENDED' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                          booking.status === 'CONFIRMED' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                          booking.status === 'NO_SHOW' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                          'bg-red-500/10 border-red-500/20 text-red-400'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-8">No booking history found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workouts & Progress Tab */}
        <TabsContent value="workouts">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Workouts & Progress</CardTitle>
              <CardDescription className="text-slate-400">
                Member workout activity and tracking data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workoutStats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Dumbbell className="h-4 w-4" />
                      <span className="text-sm">Total Workouts</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{workoutStats.totalWorkouts}</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm">Total Measurements</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{workoutStats.totalMeasurements}</p>
                  </div>
                  {workoutStats.lastWorkoutDate && (
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Last Workout</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{format(new Date(workoutStats.lastWorkoutDate), 'MMM dd, yyyy')}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-8">No workout data found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Danger Zone */}
      <Card className="bg-red-500/10 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-slate-400">
            Irreversible and dangerous actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
            <div>
              <h4 className="font-semibold text-white">Change Role</h4>
              <p className="text-sm text-slate-400">Promote or demote this member</p>
            </div>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300"
              onClick={() => setIsChangeRoleDialogOpen(true)}
            >
              <Shield className="h-4 w-4 mr-2" />
              Change Role
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
            <div>
              <h4 className="font-semibold text-white">
                {member.isSuspended ? 'Unsuspend Account' : 'Suspend Account'}
              </h4>
              <p className="text-sm text-slate-400">
                {member.isSuspended ? 'Reinstate account access' : 'Temporarily disable account access'}
              </p>
            </div>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300"
              onClick={() => toggleSuspensionMutation.mutate()}
            >
              {member.isSuspended ? (
                <>
                  <ToggleRight className="h-4 w-4 mr-2" />
                  Unsuspend
                </>
              ) : (
                <>
                  <ToggleLeft className="h-4 w-4 mr-2" />
                  Suspend
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
            <div>
              <h4 className="font-semibold text-white">Delete Member</h4>
              <p className="text-sm text-slate-400">Permanently delete this member account</p>
            </div>
            <Button
              variant="outline"
              className="border-red-500/20 text-red-400 hover:bg-red-500/20"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Role Dialog */}
      <Dialog open={isChangeRoleDialogOpen} onOpenChange={setIsChangeRoleDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Change Member Role</DialogTitle>
            <DialogDescription className="text-slate-400">
              Change the role for {member.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">New Role</Label>
              <Select value={newRole} onValueChange={(value: any) => setNewRole(value)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="TRAINER">Trainer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChangeRoleDialogOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => changeRoleMutation.mutate(newRole)}
            >
              Change Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Member</DialogTitle>
            <DialogDescription className="text-slate-400">
              This action cannot be undone. Please type "DELETE" to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmation !== 'DELETE'}
              onClick={() => deleteMemberMutation.mutate()}
            >
              Delete Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}