import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar,
  Download,
  Plus,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Badge from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Avatar } from '@/components/ui/avatar';
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
}

interface PaginationResponse<T> {
  members: T[];
  total: number;
  page: number;
  pageSize: number;
}

const planColors = {
  INTRO: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PLUS: 'bg-green-500/10 text-green-400 border-green-500/20',
  PREMIUM: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  MAX: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const statusColors = {
  ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/20',
  EXPIRED: 'bg-red-500/10 text-red-400 border-red-500/20',
  NONE: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function MemberManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // URL params for filtering
  const search = searchParams.get('search') || '';
  const planType = searchParams.get('planType') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [searchTerm, setSearchTerm] = useState(search);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isEditMembershipModalOpen, setIsEditMembershipModalOpen] = useState(false);
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<Member | null>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchParams.set('search', searchTerm);
      } else {
        searchParams.delete('search');
      }
      setSearchParams(searchParams, { replace: true });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, searchParams]);

  // Fetch members with filters
  const { data: membersData, isLoading } = useQuery<PaginationResponse<Member>>({
    queryKey: ['admin', 'members', { search, planType, status, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (planType) params.set('planType', planType);
      if (status) params.set('status', status);
      params.set('page', page.toString());
      params.set('pageSize', '20');

      const response = await fetch(`/api/admin/members?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch members');
      return response.json();
    },
  });

  // Send renewal reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await fetch(`/api/admin/members/${memberId}/renewal-reminder`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to send reminder');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Reminder sent',
        description: 'Renewal reminder has been sent to the member.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send renewal reminder.',
        variant: 'destructive',
      });
    },
  });

  // Delete member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await fetch(`/api/admin/members/${memberId}`, {
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete member.',
        variant: 'destructive',
      });
    },
  });

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: 'MEMBER' | 'TRAINER' | 'ADMIN' }) => {
      const response = await fetch(`/api/admin/members/${memberId}/role`, {
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to change member role.',
        variant: 'destructive',
      });
    },
  });

  const members = membersData?.members || [];
  const totalMembers = membersData?.total || 0;
  const totalPages = Math.ceil(totalMembers / 20);

  // Calculate days remaining
  const getDaysRemaining = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDaysRemainingColor = (days: number | null) => {
    if (days === null) return 'text-slate-400';
    if (days <= 3) return 'text-red-400 font-semibold';
    if (days <= 10) return 'text-orange-400';
    return 'text-slate-300';
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Plan', 'Status', 'Expiry Date', 'Join Date', 'Role'];
    const csvContent = [
      headers.join(','),
      ...members.map(member => [
        member.name,
        member.email,
        member.phone,
        member.planType || 'N/A',
        member.membershipStatus,
        member.membershipExpiry ? format(new Date(member.membershipExpiry), 'yyyy-MM-dd') : 'N/A',
        format(new Date(member.joinDate), 'yyyy-MM-dd'),
        member.role,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Bulk send reminders
  const bulkSendReminders = async () => {
    if (selectedMembers.size === 0) return;
    
    for (const memberId of selectedMembers) {
      await sendReminderMutation.mutateAsync(memberId);
    }
    
    setSelectedMembers(new Set());
    toast({
      title: 'Bulk reminders sent',
      description: `Sent renewal reminders to ${selectedMembers.size} members.`,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(new Set(members.map(m => m.id)));
    } else {
      setSelectedMembers(new Set());
    }
  };

  const handleSelectMember = (memberId: string, checked: boolean) => {
    const newSelected = new Set(selectedMembers);
    if (checked) {
      newSelected.add(memberId);
    } else {
      newSelected.delete(memberId);
    }
    setSelectedMembers(newSelected);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Member Management</h1>
          <p className="text-slate-400">Manage gym members, memberships, and roles</p>
        </div>
        <Button onClick={() => setIsAddMemberModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={planType} onValueChange={(value) => {
            if (value) {
              searchParams.set('planType', value);
            } else {
              searchParams.delete('planType');
            }
            setSearchParams(searchParams, { replace: true });
          }}>
            <SelectTrigger className="w-[150px] bg-slate-800/50 border-slate-700 text-white">
              <SelectValue placeholder="Plan Type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="">All Plans</SelectItem>
              <SelectItem value="INTRO">Intro</SelectItem>
              <SelectItem value="PLUS">Plus</SelectItem>
              <SelectItem value="PREMIUM">Premium</SelectItem>
              <SelectItem value="MAX">Max</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(value) => {
            if (value) {
              searchParams.set('status', value);
            } else {
              searchParams.delete('status');
            }
            setSearchParams(searchParams, { replace: true });
          }}>
            <SelectTrigger className="w-[150px] bg-slate-800/50 border-slate-700 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="NONE">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedMembers.size > 0 && (
        <div className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <span className="text-sm text-purple-300">
            {selectedMembers.size} member{selectedMembers.size !== 1 ? 's' : ''} selected
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={bulkSendReminders}
            className="border-purple-500/20 text-purple-300 hover:bg-purple-500/20"
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Reminders
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            className="border-purple-500/20 text-purple-300 hover:bg-purple-500/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Selected
          </Button>
        </div>
      )}

      {/* Members Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-900/50">
              <TableRow className="border-slate-700">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedMembers.size === members.length && members.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-slate-300">Member</TableHead>
                <TableHead className="text-slate-300">Contact</TableHead>
                <TableHead className="text-slate-300">Plan</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Expiry</TableHead>
                <TableHead className="text-slate-300">Days Left</TableHead>
                <TableHead className="text-slate-300">Joined</TableHead>
                <TableHead className="text-slate-300 w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    Loading members...
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                    No members found
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => {
                  const daysRemaining = getDaysRemaining(member.membershipExpiry);
                  
                  return (
                    <TableRow key={member.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell>
                        <Checkbox
                          checked={selectedMembers.has(member.id)}
                          onCheckedChange={(checked) => handleSelectMember(member.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt={member.name} />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                                {member.name.split(' ').map((n) => n[0]).join('')}
                              </div>
                            )}
                          </Avatar>
                          <div>
                            <div className="font-medium text-white">{member.name}</div>
                            <Badge variant="sky" className="text-xs bg-purple-500/10 border-purple-500/20 text-purple-400">
                              {member.role}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Phone className="h-3 w-3" />
                            {member.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.planType ? (
                          <Badge className={planColors[member.planType]}>
                            {member.planType}
                          </Badge>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[member.membershipStatus]}>
                          {member.membershipStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.membershipExpiry ? (
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(member.membershipExpiry), 'MMM dd, yyyy')}
                          </div>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {daysRemaining !== null ? (
                          <span className={getDaysRemainingColor(daysRemaining)}>
                            {daysRemaining} days
                          </span>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-300">
                          {format(new Date(member.joinDate), 'MMM dd, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem className="text-slate-300 hover:text-white focus:bg-slate-700">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Membership
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem 
                              className="text-slate-300 hover:text-white focus:bg-slate-700"
                              onClick={() => changeRoleMutation.mutate({ memberId: member.id, role: 'TRAINER' })}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Make Trainer
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-slate-300 hover:text-white focus:bg-slate-700"
                              onClick={() => sendReminderMutation.mutate(member.id)}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem 
                              className="text-red-400 hover:text-red-300 focus:bg-slate-700"
                              onClick={() => deleteMemberMutation.mutate(member.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700">
          <div className="text-sm text-slate-400">
            Showing {members.length} of {totalMembers} members
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (page > 1) {
                  searchParams.set('page', (page - 1).toString());
                  setSearchParams(searchParams, { replace: true });
                }
              }}
              disabled={page <= 1}
              className="border-slate-700 text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-slate-300">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (page < totalPages) {
                  searchParams.set('page', (page + 1).toString());
                  setSearchParams(searchParams, { replace: true });
                }
              }}
              disabled={page >= totalPages}
              className="border-slate-700 text-slate-300"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Member</DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a new member account and optionally assign a membership plan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Full Name</Label>
              <Input placeholder="John Doe" className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Email</Label>
              <Input type="email" placeholder="john@example.com" className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Phone</Label>
              <Input type="tel" placeholder="+1234567890" className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Password</Label>
              <Input type="password" placeholder="••••••••" className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Membership Plan (Optional)</Label>
              <Select>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="INTRO">Intro Plan</SelectItem>
                  <SelectItem value="PLUS">Plus Plan</SelectItem>
                  <SelectItem value="PREMIUM">Premium Plan</SelectItem>
                  <SelectItem value="MAX">Max Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberModalOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Create Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}