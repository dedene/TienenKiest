'use client';

import { QuestionEditor } from '@/components/admin/question-editor';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { IconButton } from '@/components/ui/icon-button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { trpc } from '@/lib/trpc';
import {
  AlertCircle,
  PencilIcon,
  PlusCircle,
  TrashIcon,
  Star,
  StarIcon,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';

export const QuestionTable = () => {
  const [editingQuestion, setEditingQuestion] = useState<{
    id: string;
    text: string;
    answer1Text?: string;
    answer2Text?: string;
  } | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [deletingQuestion, setDeletingQuestion] = useState<{
    id: string;
    text: string;
  } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [resetCountersQuestion, setResetCountersQuestion] = useState<{
    id: string;
    text: string;
  } | null>(null);
  const [isResetCountersDialogOpen, setIsResetCountersDialogOpen] = useState(false);

  // Local state to track real-time counters
  const [liveCounters, setLiveCounters] = useState<Record<string, number>>({});

  // Fetch questions using tRPC
  const { data: questions, isLoading, error, refetch } = trpc.questions.getAll.useQuery();

  // Subscribe to counter updates
  trpc.subscriptions.counterUpdates.useSubscription(undefined, {
    onData: (data) => {
      setLiveCounters((prev) => ({
        ...prev,
        [data.answerId]: data.count,
      }));
    },
    onError: (err) => {
      console.error('Subscription error:', err);
    },
  });

  // tRPC mutations
  const toggleActiveMutation = trpc.questions.toggleActive.useMutation({
    onSuccess: () => refetch(),
  });

  const createQuestionMutation = trpc.questions.create.useMutation({
    onSuccess: () => refetch(),
  });

  const updateQuestionMutation = trpc.questions.update.useMutation({
    onSuccess: () => refetch(),
  });

  const deleteQuestionMutation = trpc.questions.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const resetCountersMutation = trpc.questions.resetCounters.useMutation({
    onSuccess: () => refetch(),
  });

  const handleActivate = async (questionId: string) => {
    toggleActiveMutation.mutate({
      id: questionId,
      action: 'activate',
    });
  };

  const handleEdit = (question: {
    id: string;
    text: string;
    answer1Text?: string;
    answer2Text?: string;
  }) => {
    setEditingQuestion(question);
    setIsEditorOpen(true);
  };

  const handleAdd = () => {
    setEditingQuestion(null);
    setIsEditorOpen(true);
  };

  const handleDelete = (question: { id: string; text: string }) => {
    setDeletingQuestion(question);
    setIsDeleteDialogOpen(true);
  };

  const handleResetCounters = (question: { id: string; text: string }) => {
    setResetCountersQuestion(question);
    setIsResetCountersDialogOpen(true);
  };

  const confirmResetCounters = async () => {
    if (resetCountersQuestion == null) return;

    await resetCountersMutation.mutateAsync(resetCountersQuestion.id);
    setIsResetCountersDialogOpen(false);
  };

  const handleColorChange = (questionId: string, answerPosition: 1 | 2) => (color: string) => {
    // Update color in the database
    const question = questions?.find((q) => q.id === questionId);
    if (!question) return;

    updateQuestionMutation.mutate({
      id: questionId,
      text: question.text,
      [`answer${answerPosition}Color`]: color,
    });
  };

  const saveQuestion = async (questionData: {
    id?: string;
    text: string;
    answer1Text?: string;
    answer2Text?: string;
    answer1Color?: string;
    answer2Color?: string;
  }) => {
    if (questionData.id) {
      // Update existing question
      updateQuestionMutation.mutate({
        id: questionData.id,
        text: questionData.text,
        answer1Text: questionData.answer1Text,
        answer2Text: questionData.answer2Text,
        answer1Color: questionData.answer1Color,
        answer2Color: questionData.answer2Color,
      });
    } else {
      // Create new question
      createQuestionMutation.mutate({
        text: questionData.text,
        answer1Text: questionData.answer1Text || 'Ja',
        answer2Text: questionData.answer2Text || 'Nee',
        answer1Color: questionData.answer1Color || '#0D9900',
        answer2Color: questionData.answer2Color || '#D10000',
      });
    }
  };

  const confirmDelete = async () => {
    if (!deletingQuestion) return;
    deleteQuestionMutation.mutate({ id: deletingQuestion.id });
  };

  // Helper function to get the current count for an answer
  const getAnswerCount = (questionId: string, answerPosition: 1 | 2, defaultCount: number) => {
    const answerId = `${questionId}_answer${answerPosition}`;
    // Only use live counters for active questions
    const activeQuestion = questions?.find((q) => q.id === questionId && q.isActive);

    if (activeQuestion && answerId in liveCounters) {
      return liveCounters[answerId];
    }
    return defaultCount;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>

        <Button onClick={handleAdd} className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Nieuwe vraag
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle vragen</CardTitle>
          <CardDescription>Beheer vragen en antwoorden</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Laden...</p>
          ) : error ? (
            <div className="flex items-center text-red-500 mb-4">
              <AlertCircle className="h-5 w-5 mr-2" />
              Er is een fout opgetreden bij het ophalen van de vragen.
            </div>
          ) : !questions || questions.length === 0 ? (
            <p>Geen vragen gevonden. Klik op &apos;Nieuwe vraag&apos; om te beginnen.</p>
          ) : (
            <Table>
              <TableCaption>Lijst van alle beschikbare vragen</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Vraag</TableHead>
                  <TableHead>Antwoord 1 + Stemmen</TableHead>
                  <TableHead>Antwoord 2 + Stemmen</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {question.text}
                        {question.isActive && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Actief
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-between">
                        <span>{question.answer1Text}</span>
                        <ColorPicker
                          value={question.answer1Color || '#0D9900'}
                          onChange={handleColorChange(question.id, 1)}
                        >
                          <Badge
                            className={question.isActive ? 'animate-pulse' : ''}
                            style={{ backgroundColor: question.answer1Color }}
                          >
                            {getAnswerCount(question.id, 1, question.answer1Count)}
                          </Badge>
                        </ColorPicker>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-between">
                        <span>{question.answer2Text}</span>
                        <ColorPicker
                          value={question.answer2Color || '#D10000'}
                          onChange={handleColorChange(question.id, 2)}
                        >
                          <Badge
                            className={question.isActive ? 'animate-pulse' : ''}
                            style={{ backgroundColor: question.answer2Color }}
                          >
                            {getAnswerCount(question.id, 2, question.answer2Count)}
                          </Badge>
                        </ColorPicker>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <IconButton
                          icon={
                            question.isActive ? (
                              <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )
                          }
                          onClick={() => handleActivate(question.id)}
                          variant="outline"
                          className={question.isActive ? 'bg-yellow-50' : ''}
                          aria-label={question.isActive ? 'Actieve vraag' : 'Activeer vraag'}
                        />
                        <IconButton
                          icon={<PencilIcon className="h-4 w-4" />}
                          onClick={() => handleEdit(question)}
                          aria-label="Bewerk vraag"
                        />
                        <IconButton
                          icon={<RotateCcw className="h-4 w-4" />}
                          variant="outline"
                          onClick={() => handleResetCounters(question)}
                          aria-label="Reset tellers"
                        />
                        <IconButton
                          disabled={question.isActive}
                          icon={<TrashIcon className="h-4 w-4" />}
                          variant="destructive-outline"
                          onClick={() => handleDelete(question)}
                          aria-label="Verwijder vraag"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live voorbeeld</CardTitle>
          <CardDescription>Bekijk wat gebruikers zien</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bekijk de huidige actieve vraag en opties zoals deze aan gebruikers wordt getoond.
          </p>
        </CardContent>
        <div className="flex justify-end px-6 pb-6">
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            Open live weergave
          </Button>
        </div>
      </Card>

      <QuestionEditor
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        question={editingQuestion || undefined}
        onSave={saveQuestion}
      />

      <DeleteConfirmation
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={deletingQuestion?.text || ''}
        onConfirm={confirmDelete}
      />

      <Dialog open={isResetCountersDialogOpen} onOpenChange={setIsResetCountersDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tellers resetten</DialogTitle>
            <DialogDescription>
              Weet je zeker dat je alle stemtellingen voor &ldquo;{resetCountersQuestion?.text}
              &rdquo; wilt resetten? Alle tellingen worden op 0 gezet. Deze actie kan niet ongedaan
              worden gemaakt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetCountersDialogOpen(false)}>
              Annuleren
            </Button>
            <Button variant="default" onClick={confirmResetCounters}>
              Tellers resetten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
