'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Question } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';
import { useState } from 'react';

interface QuestionEditorProps {
  question?: Question;
  topicId: string;
  onSave: (question: Omit<Question, 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  onDelete?: (questionId: string) => Promise<boolean>;
}

export function QuestionEditor({ question, topicId, onSave, onDelete }: QuestionEditorProps) {
  const [text, setText] = useState(question?.text || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter text for the question.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const questionData = {
        id: question?.id || generateId(),
        topicId,
        text,
      };

      const success = await onSave(questionData);

      if (success) {
        toast({
          title: 'Success',
          description: `Question ${question ? 'updated' : 'created'} successfully.`,
        });
      } else {
        toast({
          title: 'Error',
          description: `Failed to ${question ? 'update' : 'create'} question.`,
          variant: 'destructive',
        });
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!question || !onDelete) return;

    if (
      window.confirm(
        'Are you sure you want to delete this question? This will also delete all associated answers.'
      )
    ) {
      setIsDeleting(true);

      try {
        const success = await onDelete(question.id);

        if (success) {
          toast({
            title: 'Success',
            description: 'Question deleted successfully.',
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to delete question.',
            variant: 'destructive',
          });
        }
      } catch (_error) {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred.',
          variant: 'destructive',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{question ? 'Edit Question' : 'Create Question'}</CardTitle>
        <CardDescription>
          {question ? 'Update the question details' : 'Create a new question'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Question Text</Label>
            <Input
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter question text"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : question ? 'Update Question' : 'Create Question'}
          </Button>

          {question && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Question'}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
