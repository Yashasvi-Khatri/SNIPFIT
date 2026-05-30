import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, Clock, Activity } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weightKg?: number | null;
  notes?: string | null;
  order: number;
}

interface Workout {
  id: string;
  date: string;
  notes?: string | null;
  duration?: number | null;
  exercises: Exercise[];
}

interface WorkoutDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: Workout | null;
  onEdit: (workout: Workout) => void;
  onDelete: (id: string) => Promise<void>;
  isDeleting?: boolean;
}

export default function WorkoutDetailModal({
  isOpen,
  onClose,
  workout,
  onEdit,
  onDelete,
  isDeleting = false,
}: WorkoutDetailModalProps) {
  if (!workout) return null;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      await onDelete(workout.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Workout Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Workout Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-surface-elevated rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground" size={18} />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">{format(new Date(workout.date), 'EEEE, MMMM d, yyyy')}</p>
              </div>
            </div>

            {workout.duration && (
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground" size={18} />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{workout.duration} minutes</p>
                </div>
              </div>
            )}

            {workout.notes && (
              <div className="col-span-2 mt-2">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{workout.notes}</p>
              </div>
            )}
          </div>

          {/* Exercises Table */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="text-muted-foreground" size={18} />
              <h3 className="font-semibold text-lg">Exercises ({workout.exercises.length})</h3>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-surface-elevated">
                  <tr>
                    <th className="text-left p-3 font-semibold">Exercise</th>
                    <th className="text-center p-3 font-semibold">Sets</th>
                    <th className="text-center p-3 font-semibold">Reps</th>
                    <th className="text-center p-3 font-semibold">Weight</th>
                    <th className="text-left p-3 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {workout.exercises.map((exercise) => (
                    <tr key={exercise.id} className="border-t">
                      <td className="p-3 font-medium">{exercise.name}</td>
                      <td className="p-3 text-center">{exercise.sets}</td>
                      <td className="p-3 text-center">{exercise.reps}</td>
                      <td className="p-3 text-center">
                        {exercise.weightKg ? `${exercise.weightKg} kg` : '-'}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {exercise.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onEdit(workout)}
            className="gap-2"
          >
            <Edit size={16} />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 size={16} />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
