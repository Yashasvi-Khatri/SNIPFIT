import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  X,
  Check,
  User,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns';

interface Class {
  id: string;
  name: string;
  type: 'YOGA' | 'STRENGTH' | 'CARDIO' | 'HIIT' | 'DANCE' | 'OTHER';
  trainerId: string;
  trainerName: string;
  startTime: string;
  endTime: string;
  capacity: number;
  enrolled: number;
  location: string;
  description: string;
  isRecurring: boolean;
  cancelledAt: string | null;
}

interface Trainer {
  id: string;
  name: string;
  email: string;
}

const classTypeColors = {
  YOGA: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  STRENGTH: 'bg-red-500/10 border-red-500/20 text-red-400',
  CARDIO: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  HIIT: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  DANCE: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
  OTHER: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
};

const classTypeIcons: { [key: string]: string } = {
  YOGA: '🧘',
  STRENGTH: '💪',
  CARDIO: '🏃',
  HIIT: '⚡',
  DANCE: '💃',
  OTHER: '🏋️',
};

export default function ClassManagement() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState<Class | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    type: 'YOGA' | 'STRENGTH' | 'CARDIO' | 'HIIT' | 'DANCE' | 'OTHER';
    trainerId: string;
    startTime: string;
    endTime: string;
    capacity: number;
    location: string;
    description: string;
    isRecurring: boolean;
  }>({
    name: '',
    type: 'OTHER',
    trainerId: '',
    startTime: '',
    endTime: '',
    capacity: 20,
    location: '',
    description: '',
    isRecurring: false,
  });

  // Fetch classes
  const { data: classes, isLoading } = useQuery<Class[]>({
    queryKey: ['admin', 'classes'],
    queryFn: async () => {
      const response = await fetch('/api/admin/classes', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch classes');
      return response.json();
    },
  });

  // Fetch trainers
  const { data: trainers } = useQuery<Trainer[]>({
    queryKey: ['admin', 'trainers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/trainers', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch trainers');
      return response.json();
    },
  });

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: async (classData: typeof formData) => {
      const response = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to create class');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Class created',
        description: 'New class has been successfully created.',
      });
      setIsCreateClassModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin', 'classes'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create class.',
        variant: 'destructive',
      });
    },
  });

  // Update class mutation
  const updateClassMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const response = await fetch(`/api/admin/classes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update class');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Class updated',
        description: 'Class has been successfully updated.',
      });
      setIsEditClassModalOpen(false);
      setSelectedClass(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin', 'classes'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update class.',
        variant: 'destructive',
      });
    },
  });

  // Cancel class mutation
  const cancelClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      const response = await fetch(`/api/admin/classes/${classId}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to cancel class');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Class cancelled',
        description: 'Class has been successfully cancelled.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'classes'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to cancel class.',
        variant: 'destructive',
      });
    },
  });

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      const response = await fetch(`/api/admin/classes/${classId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete class');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Class deleted',
        description: 'Class has been successfully deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'classes'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete class.',
        variant: 'destructive',
      });
    },
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async ({ classId, bookings }: { classId: string; bookings: any[] }) => {
      const response = await fetch(`/api/admin/classes/${classId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookings }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to mark attendance');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Attendance marked',
        description: 'Attendance has been successfully recorded.',
      });
      setIsAttendanceModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin', 'classes'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to mark attendance.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'OTHER',
      trainerId: '',
      startTime: '',
      endTime: '',
      capacity: 20,
      location: '',
      description: '',
      isRecurring: false,
    });
  };

  const handleCreateClass = () => {
    createClassMutation.mutate(formData);
  };

  const handleUpdateClass = () => {
    if (selectedClass) {
      updateClassMutation.mutate({ id: selectedClass.id, data: formData });
    }
  };

  const handleEditClass = (classData: Class) => {
    setSelectedClass(classData);
    setFormData({
      name: classData.name,
      type: classData.type as 'YOGA' | 'STRENGTH' | 'CARDIO' | 'HIIT' | 'DANCE' | 'OTHER',
      trainerId: classData.trainerId,
      startTime: classData.startTime,
      endTime: classData.endTime,
      capacity: classData.capacity,
      location: classData.location,
      description: classData.description,
      isRecurring: classData.isRecurring,
    });
    setIsEditClassModalOpen(true);
  };

  const handleCancelClass = (classId: string) => {
    if (confirm('Are you sure you want to cancel this class? This will notify all enrolled members.')) {
      cancelClassMutation.mutate(classId);
    }
  };

  const handleDeleteClass = (classId: string) => {
    if (confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      deleteClassMutation.mutate(classId);
    }
  };

  const handleViewAttendance = (classData: Class) => {
    setSelectedClassForAttendance(classData);
    setIsAttendanceModalOpen(true);
  };

  // Get week days
  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: addDays(currentWeekStart, 6),
  });

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(
      direction === 'prev' 
        ? addDays(currentWeekStart, -7) 
        : addDays(currentWeekStart, 7)
    );
  };

  // Get classes for a specific day
  const getClassesForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return classes?.filter(c => c.startTime.startsWith(dateStr)) || [];
  };

  // Trainer workload summary
  const getTrainerWorkload = (trainerId: string) => {
    return classes?.filter(c => 
      c.trainerId === trainerId && 
      !c.cancelledAt && 
      c.startTime >= format(currentWeekStart, "yyyy-MM-dd'T00:00:00") &&
      c.startTime <= format(addDays(currentWeekStart, 6), "yyyy-MM-dd'T23:59:59")
    ).length || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Class Management</h1>
          <p className="text-slate-400">Schedule and manage gym classes</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-slate-700 rounded-lg">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className={viewMode === 'calendar' ? 'bg-purple-600 hover:bg-purple-700' : 'text-slate-400 hover:text-white'}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-purple-600 hover:bg-purple-700' : 'text-slate-400 hover:text-white'}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
          <Button onClick={() => setIsCreateClassModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Class
          </Button>
        </div>
      </div>

      {/* Trainer Workload Summary */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Trainer Workload This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {trainers?.map((trainer) => (
              <div key={trainer.id} className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                  {trainer.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{trainer.name}</p>
                  <p className="text-xs text-slate-400">{getTrainerWorkload(trainer.id)} classes</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {viewMode === 'calendar' ? (
        /* Calendar View */
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
              className="border-slate-700 text-slate-300"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Week
            </Button>
            <h3 className="text-lg font-semibold text-white">
              {format(currentWeekStart, 'MMM dd')} - {format(addDays(currentWeekStart, 6), 'MMM dd, yyyy')}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
              className="border-slate-700 text-slate-300"
            >
              Next Week
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {/* Day Headers */}
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="p-4 border-r border-b border-slate-700 bg-slate-900/50">
                <p className="text-xs text-slate-400 uppercase">{format(day, 'EEEE')}</p>
                <p className="text-lg font-semibold text-white">{format(day, 'dd')}</p>
              </div>
            ))}

            {/* Day Columns */}
            {weekDays.map((day) => {
              const dayClasses = getClassesForDay(day);
              return (
                <div key={day.toISOString()} className="min-h-[400px] border-r border-slate-700 p-2 space-y-2">
                  {dayClasses.length === 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full border border-dashed border-slate-700 text-slate-500 hover:text-white hover:border-slate-500"
                      onClick={() => {
                        const startTime = format(day, "yyyy-MM-dd'T09:00:00");
                        const endTime = format(day, "yyyy-MM-dd'T10:00:00");
                        setFormData({ ...formData, startTime, endTime });
                        setIsCreateClassModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                  {dayClasses.map((classData) => (
                    <div
                      key={classData.id}
                      className={`
                        p-3 rounded-lg cursor-pointer transition-all hover:scale-105
                        ${classTypeColors[classData.type]}
                        ${classData.cancelledAt ? 'opacity-50 line-through' : ''}
                        border
                      `}
                      onClick={() => handleEditClass(classData)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{classTypeIcons[classData.type]}</span>
                        <span className="font-medium text-white text-sm">{classData.name}</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-slate-300">
                            {format(new Date(classData.startTime), 'HH:mm')} - {format(new Date(classData.endTime), 'HH:mm')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="text-slate-300">{classData.trainerName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className="text-slate-300">
                            {classData.enrolled}/{classData.capacity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-700">
              {classes?.map((classData) => (
                <div key={classData.id} className="p-4 hover:bg-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${classTypeColors[classData.type]} border`}>
                        <span className="text-2xl">{classTypeIcons[classData.type]}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{classData.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(classData.startTime), 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(classData.startTime), 'HH:mm')} - {format(new Date(classData.endTime), 'HH:mm')}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {classData.trainerName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {classData.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-300">
                            {classData.enrolled}/{classData.capacity}
                          </span>
                        </div>
                        <Badge className={classTypeColors[classData.type]}>
                          {classData.type}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                          <DropdownMenuItem 
                            className="text-slate-300 hover:text-white focus:bg-slate-700"
                            onClick={() => handleEditClass(classData)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Class
                          </DropdownMenuItem>
                          {!classData.cancelledAt && (
                            <>
                              <DropdownMenuItem 
                                className="text-slate-300 hover:text-white focus:bg-slate-700"
                                onClick={() => handleCancelClass(classData.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel Class
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-slate-300 hover:text-white focus:bg-slate-700"
                                onClick={() => handleViewAttendance(classData)}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Mark Attendance
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator className="bg-slate-700" />
                          <DropdownMenuItem 
                            className="text-red-400 hover:text-red-300 focus:bg-slate-700"
                            onClick={() => handleDeleteClass(classData.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Class
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Class Modal */}
      <Dialog open={isCreateClassModalOpen} onOpenChange={setIsCreateClassModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Class</DialogTitle>
            <DialogDescription className="text-slate-400">
              Schedule a new gym class
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label className="text-slate-300">Class Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Morning Yoga Session"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Class Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value as 'YOGA' | 'STRENGTH' | 'CARDIO' | 'HIIT' | 'DANCE' | 'OTHER' })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="YOGA">🧘 Yoga</SelectItem>
                  <SelectItem value="STRENGTH">💪 Strength</SelectItem>
                  <SelectItem value="CARDIO">🏃 Cardio</SelectItem>
                  <SelectItem value="HIIT">⚡ HIIT</SelectItem>
                  <SelectItem value="DANCE">💃 Dance</SelectItem>
                  <SelectItem value="OTHER">🏋️ Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Trainer</Label>
              <Select 
                value={formData.trainerId} 
                onValueChange={(value: string) => setFormData({ ...formData, trainerId: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select trainer" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {trainers?.map((trainer) => (
                    <SelectItem key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Start Time</Label>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">End Time</Label>
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Capacity</Label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Studio A"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-slate-300">Description</Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Class description..."
                rows={3}
                className="w-full bg-slate-800 border-slate-700 text-white rounded-md p-2"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="recurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked as boolean })}
                />
                <Label htmlFor="recurring" className="text-slate-300">Recurring Class</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateClassModalOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateClass}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={createClassMutation.isPending}
            >
              {createClassMutation.isPending ? 'Creating...' : 'Create Class'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Modal */}
      <Dialog open={isEditClassModalOpen} onOpenChange={setIsEditClassModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Class</DialogTitle>
            <DialogDescription className="text-slate-400">
              Modify class details
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Same form fields as Create Class Modal */}
            <div className="space-y-2 col-span-2">
              <Label className="text-slate-300">Class Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Class Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value as 'YOGA' | 'STRENGTH' | 'CARDIO' | 'HIIT' | 'DANCE' | 'OTHER' })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="YOGA">🧘 Yoga</SelectItem>
                  <SelectItem value="STRENGTH">💪 Strength</SelectItem>
                  <SelectItem value="CARDIO">🏃 Cardio</SelectItem>
                  <SelectItem value="HIIT">⚡ HIIT</SelectItem>
                  <SelectItem value="DANCE">💃 Dance</SelectItem>
                  <SelectItem value="OTHER">🏋️ Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Trainer</Label>
              <Select 
                value={formData.trainerId} 
                onValueChange={(value) => setFormData({ ...formData, trainerId: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {trainers?.map((trainer) => (
                    <SelectItem key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Start Time</Label>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">End Time</Label>
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Capacity</Label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-slate-300">Description</Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-slate-800 border-slate-700 text-white rounded-md p-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditClassModalOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateClass}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={updateClassMutation.isPending}
            >
              {updateClassMutation.isPending ? 'Updating...' : 'Update Class'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}