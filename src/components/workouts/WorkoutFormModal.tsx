import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, X } from 'lucide-react';

const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  sets: z.number().int().min(1, 'Sets must be at least 1'),
  reps: z.number().int().min(1, 'Reps must be at least 1'),
  weightKg: z.number().min(0).optional(),
  notes: z.string().optional(),
  order: z.number().int().min(0),
});

const workoutSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  duration: z.number().int().min(1).optional(),
  exercises: z.array(exerciseSchema).min(1, 'At least one exercise is required'),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

const COMMON_EXERCISES = [
  "Bench Press", "Squat", "Deadlift", "Pull-up", "Push-up", 
  "Shoulder Press", "Bicep Curl", "Tricep Extension", "Leg Press", 
  "Lat Pulldown", "Cable Row", "Plank", "Lunges", "Hip Thrust", 
  "Romanian Deadlift", "Incline Bench", "Dumbbell Row", "Face Pull", 
  "Calf Raise", "Leg Curl"
];

interface WorkoutFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkoutFormData) => Promise<void>;
  editData?: any;
  isLoading?: boolean;
}

export default function WorkoutFormModal({
  isOpen,
  onClose,
  onSubmit,
  editData,
  isLoading = false,
}: WorkoutFormModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      notes: '',
      duration: undefined,
      exercises: [{ name: '', sets: 3, reps: 10, weightKg: undefined, notes: '', order: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'exercises',
  });

  useEffect(() => {
    if (editData) {
      reset({
        date: new Date(editData.date).toISOString().split('T')[0],
        notes: editData.notes || '',
        duration: editData.duration || undefined,
        exercises: editData.exercises || [{ name: '', sets: 3, reps: 10, weightKg: undefined, notes: '', order: 0 }],
      });
    } else {
      reset({
        date: new Date().toISOString().split('T')[0],
        notes: '',
        duration: undefined,
        exercises: [{ name: '', sets: 3, reps: 10, weightKg: undefined, notes: '', order: 0 }],
      });
    }
  }, [editData, reset, isOpen]);

  const handleFormSubmit = async (data: WorkoutFormData) => {
    await onSubmit(data);
    if (!editData) {
      reset({
        date: new Date().toISOString().split('T')[0],
        notes: '',
        duration: undefined,
        exercises: [{ name: '', sets: 3, reps: 10, weightKg: undefined, notes: '', order: 0 }],
      });
    }
    onClose();
  };

  const addExercise = () => {
    const currentOrder = fields.length;
    append({
      name: '',
      sets: 3,
      reps: 10,
      weightKg: undefined,
      notes: '',
      order: currentOrder,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit Workout' : 'Log New Workout'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Date and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) - Optional</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="45"
                {...register('duration', { valueAsNumber: true })}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes - Optional</Label>
            <Textarea
              id="notes"
              placeholder="How did the workout feel? Any PRs?"
              {...register('notes')}
              rows={3}
            />
          </div>

          {/* Exercises */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Exercises</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExercise}
                className="gap-2"
              >
                <Plus size={16} />
                Add Exercise
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="text-sm text-red-500">At least one exercise is required</p>
            )}

            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-3 relative">
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    onClick={() => remove(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}

                <div className="space-y-2">
                  <Label>Exercise Name</Label>
                  <Input
                    list="exercises"
                    placeholder="e.g., Bench Press"
                    {...register(`exercises.${index}.name`)}
                    className={errors.exercises?.[index]?.name ? 'border-red-500' : ''}
                  />
                  <datalist id="exercises">
                    {COMMON_EXERCISES.map((exercise) => (
                      <option key={exercise} value={exercise} />
                    ))}
                  </datalist>
                  {errors.exercises?.[index]?.name && (
                    <p className="text-sm text-red-500">{errors.exercises[index]?.name?.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Sets</Label>
                    <Input
                      type="number"
                      min="1"
                      {...register(`exercises.${index}.sets`, { valueAsNumber: true })}
                      className={errors.exercises?.[index]?.sets ? 'border-red-500' : ''}
                    />
                    {errors.exercises?.[index]?.sets && (
                      <p className="text-sm text-red-500">{errors.exercises[index]?.sets?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Reps</Label>
                    <Input
                      type="number"
                      min="1"
                      {...register(`exercises.${index}.reps`, { valueAsNumber: true })}
                      className={errors.exercises?.[index]?.reps ? 'border-red-500' : ''}
                    />
                    {errors.exercises?.[index]?.reps && (
                      <p className="text-sm text-red-500">{errors.exercises[index]?.reps?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Weight (kg) - Optional</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="kg"
                      {...register(`exercises.${index}.weightKg`, { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Exercise Notes - Optional</Label>
                  <Input
                    placeholder="Form cues, modifications, etc."
                    {...register(`exercises.${index}.notes`)}
                  />
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-orange-500 hover:bg-orange-600">
              {isLoading ? 'Saving...' : editData ? 'Update Workout' : 'Save Workout'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
