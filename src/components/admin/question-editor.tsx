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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{question ? 'Vraag bewerken' : 'Nieuwe vraag'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="text" className="text-right">
              Vraag
            </Label>
            <div className="col-span-3">
              <Input
                id="text"
                {...register('text', { required: true })}
                placeholder="Vul de vraag in..."
              />
              {errors.text && <p className="text-sm text-red-500 mt-1">{errors.text.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="answer1Text" className="text-right">
              Antwoord 1
            </Label>
            <div className="col-span-2">
              <Input
                id="answer1Text"
                {...register('answer1Text', { required: true })}
                placeholder="Vul het eerste antwoord in..."
              />
              {errors.answer1Text && (
                <p className="text-sm text-red-500 mt-1">{errors.answer1Text.message}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="answer1Color" className="sr-only">
                Kleur
              </Label>
              <ColorPicker
                value={answer1Color}
                onChange={(value) => setValue('answer1Color', value)}
                className="h-8 w-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="answer2Text" className="text-right">
              Antwoord 2
            </Label>
            <div className="col-span-2">
              <Input
                id="answer2Text"
                {...register('answer2Text', { required: true })}
                placeholder="Vul het tweede antwoord in..."
              />
              {errors.answer2Text && (
                <p className="text-sm text-red-500 mt-1">{errors.answer2Text.message}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="answer2Color" className="sr-only">
                Kleur
              </Label>
              <ColorPicker
                value={answer2Color}
                onChange={(value) => setValue('answer2Color', value)}
                className="h-8 w-8"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Bezig met opslaan...' : 'Opslaan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
