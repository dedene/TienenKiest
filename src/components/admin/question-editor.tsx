'use client';

import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEFAULT_COLOR } from '@/lib/utils';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

type QuestionFormValues = {
  id?: string;
  text: string;
  answer1Text: string;
  answer2Text: string;
  answer1Color: string;
  answer2Color: string;
};

interface QuestionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: {
    id: string;
    text: string;
    answer1Text?: string;
    answer2Text?: string;
    answer1Color?: string;
    answer2Color?: string;
  };
  onSave: (question: {
    id?: string;
    text: string;
    answer1Text?: string;
    answer2Text?: string;
    answer1Color?: string;
    answer2Color?: string;
  }) => Promise<void>;
}

export function QuestionEditor({ open, onOpenChange, question, onSave }: QuestionEditorProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting, errors },
    watch,
  } = useForm<QuestionFormValues>({
    defaultValues: {
      text: '',
      answer1Text: 'Ja',
      answer2Text: 'Nee',
      answer1Color: '#0D9900',
      answer2Color: '#D10000',
    },
  });

  // Reset form when opening dialog
  useEffect(() => {
    if (open) {
      if (question) {
        // Edit existing question - populate form
        reset({
          id: question.id,
          text: question.text,
          answer1Text: question.answer1Text || 'Ja',
          answer2Text: question.answer2Text || 'Nee',
          answer1Color: question.answer1Color || DEFAULT_COLOR,
          answer2Color: question.answer2Color || DEFAULT_COLOR,
        });
      } else {
        // New question - reset to defaults
        reset({
          id: undefined,
          text: '',
          answer1Text: 'Ja',
          answer2Text: 'Nee',
          answer1Color: DEFAULT_COLOR,
          answer2Color: DEFAULT_COLOR,
        });
      }
    }
  }, [open, question, reset]);

  const answer1Color = watch('answer1Color');
  const answer2Color = watch('answer2Color');

  const onSubmit = async (data: QuestionFormValues) => {
    try {
      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl">
            {question ? 'Vraag bewerken' : 'Nieuwe vraag'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="text" className="font-medium">
                Vraag
              </Label>
              <Input
                id="text"
                {...register('text', { required: 'Vraag is verplicht' })}
                placeholder="Vul de vraag in..."
                className="w-full"
              />
              {errors.text && (
                <p className="text-sm text-destructive mt-1">{errors.text.message}</p>
              )}
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-4">
              <div className="space-y-2">
                <Label htmlFor="answer1Text" className="font-medium">
                  Antwoord 1
                </Label>
                <Input
                  id="answer1Text"
                  {...register('answer1Text', { required: 'Antwoord 1 is verplicht' })}
                  placeholder="Vul het eerste antwoord in..."
                />
                {errors.answer1Text && (
                  <p className="text-sm text-destructive mt-1">{errors.answer1Text.message}</p>
                )}
              </div>

              <div className="flex flex-col items-center justify-end pb-1">
                <Label htmlFor="answer1Color" className="mb-2 text-sm text-muted-foreground">
                  Kleur
                </Label>
                <ColorPicker
                  value={answer1Color}
                  onChange={(value) => setValue('answer1Color', value)}
                  className="h-9 w-9 rounded-md border"
                />
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-4">
              <div className="space-y-2">
                <Label htmlFor="answer2Text" className="font-medium">
                  Antwoord 2
                </Label>
                <Input
                  id="answer2Text"
                  {...register('answer2Text', { required: 'Antwoord 2 is verplicht' })}
                  placeholder="Vul het tweede antwoord in..."
                />
                {errors.answer2Text && (
                  <p className="text-sm text-destructive mt-1">{errors.answer2Text.message}</p>
                )}
              </div>

              <div className="flex flex-col items-center justify-end pb-1">
                <Label htmlFor="answer2Color" className="mb-2 text-sm text-muted-foreground">
                  Kleur
                </Label>
                <ColorPicker
                  value={answer2Color}
                  onChange={(value) => setValue('answer2Color', value)}
                  className="h-9 w-9 rounded-md border"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? 'Bezig met opslaan...' : 'Opslaan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
